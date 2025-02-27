use anyhow::Result;
use async_trait::async_trait;
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::Mutex;
use ollama_rs::Ollama;
use ollama_rs::generation::completion::request::GenerationRequest;
use tokio::sync::broadcast::Sender;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;
use std::time::Duration;
use std::fmt::Display;

use super::configuration::Configuration;
use super::prompts::{
    format_query_writer_instructions,
    format_reflection_instructions,
    SUMMARIZER_INSTRUCTIONS,
};
use super::state::{SummaryState, SummaryStateInput, SummaryStateOutput, StatusUpdate, ResearchTrack};
use super::utils::{perplexity_search, format_sources};
use super::groq::GroqClient;
use super::configuration::ResearchMode;
use super::debate::{generate_debate_perspectives, DebatePerspectives};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ResearchSource {
    title: String,
    url: String,
    content: String,
}

#[async_trait]
pub trait Node: Send + Sync {
    async fn process(&self, state: Arc<Mutex<SummaryState>>, config: &Configuration, track: &str) -> Result<String>;
}

pub struct QueryGeneratorNode;
pub struct WebResearchNode;
pub struct SummarizerNode;
pub struct ReflectionNode;
pub struct FinalizerNode;

#[async_trait]
impl Node for QueryGeneratorNode {
    async fn process(&self, state: Arc<Mutex<SummaryState>>, config: &Configuration, track: &str) -> Result<String> {
        let research_topic = {
            let state = state.lock().await;
            state.research_topic.clone()
        };
        
        let instructions = format_query_writer_instructions(&research_topic);
        let prompt = format!("{}\n\nEnhance this search query while preserving its core meaning. Original query: {}", 
            instructions, research_topic);

        let response = match config.research_mode {
            ResearchMode::Local => {
                println!("Initializing Ollama with model: {}", config.local_llm);
                let ollama = Ollama::default();
                let request = GenerationRequest::new(config.local_llm.clone(), prompt);
                ollama.generate(request).await
                    .map_err(|e| anyhow::anyhow!("Ollama request failed: {}", e))?
                    .response
            },
            ResearchMode::Remote => {
                if let Some(groq_api_key) = &config.groq_api_key {
                    println!("Using Groq with model: {}", config.groq_model);
                    let groq = GroqClient::new(groq_api_key.clone());
                    groq.generate(&prompt, &config.groq_model).await?
                } else {
                    return Err(anyhow::anyhow!("Groq API key not found"));
                }
            }
        };
        
        // Try to parse as JSON, if fails, use the original topic
        let search_query = match serde_json::from_str::<Value>(&response) {
            Ok(json) => json["query"]
                .as_str()
                .unwrap_or(&research_topic)
                .to_string(),
            Err(_) => research_topic.clone(), // Fallback to original topic if parsing fails
        };
        
        Ok(search_query)
    }
}

#[async_trait]
impl Node for WebResearchNode {
    async fn process(&self, state: Arc<Mutex<SummaryState>>, _config: &Configuration, track: &str) -> Result<String> {
        let (query, loop_count) = {
            let state = state.lock().await;
            let track_state = state.get_track(track);
            (track_state.search_query.clone(), track_state.research_loop_count as i32)
        };
        
        let search_results = perplexity_search(&query, loop_count).await?;
        
        // Convert search results to structured sources
        let sources: Vec<ResearchSource> = search_results.results.iter()
            .map(|result| ResearchSource {
                title: result.title.clone(),
                url: result.url.clone(),
                content: result.content.clone(),
            })
            .collect();
        
        // Store sources in state
        {
            let mut state_lock = state.lock().await;
            for source in &sources {
                state_lock.add_source(track, format!("- {} ({})", source.title, source.url));
            }
        }
        
        // Format results as JSON with structured content and sources
        let results_json = serde_json::json!({
            "content": sources.first()
                .map(|source| source.content.clone())
                .unwrap_or_default(),
            "sources": sources,
        });
        
        let formatted_results = results_json.to_string();
        
        {
            let mut state_lock = state.lock().await;
            // Store just the content portion in web_research_results
            if let Some(content) = results_json["content"].as_str() {
                state_lock.add_web_research_result(track, content.to_string());
            }
        }
        
        Ok(formatted_results)
    }
}

#[async_trait]
impl Node for SummarizerNode {
    async fn process(&self, state: Arc<Mutex<SummaryState>>, config: &Configuration, track: &str) -> Result<String> {
        let (research_topic, track_state) = {
            let state = state.lock().await;
            (
                state.research_topic.clone(),
                state.get_track(track).clone(),
            )
        };
        
        // Parse the last web research result as JSON to get content and sources
        let last_research = track_state.web_research_results.last()
            .cloned()
            .unwrap_or_default();
        
        let (research_content, sources) = if let Ok(json) = serde_json::from_str::<Value>(&last_research) {
            let content = json["content"].as_str().unwrap_or(&last_research).to_string();
            let sources = json["sources"].as_array()
                .and_then(|arr| serde_json::from_value::<Vec<ResearchSource>>(Value::Array(arr.clone())).ok())
                .unwrap_or_default();
            (content, sources)
        } else {
            (last_research, Vec::new())
        };
        
        let human_message = if !track_state.running_summary.is_empty() {
            format!(
                "<User Input> \n {} \n </User Input>\n\n\
                <Existing Summary> \n {} \n </Existing Summary>\n\n\
                <New Search Results> \n {} \n </New Search Results>",
                research_topic,
                track_state.running_summary,
                research_content
            )
        } else {
            format!(
                "<User Input> \n {} \n </User Input>\n\n\
                <Search Results> \n {} \n </Search Results>",
                research_topic,
                research_content
            )
        };

        let response = match config.research_mode {
            ResearchMode::Local => {
                let ollama = Ollama::default();
                let request = GenerationRequest::new(
                    config.local_llm.clone(),
                    format!("{}\n\n{}", SUMMARIZER_INSTRUCTIONS, human_message),
                );
                ollama.generate(request).await?.response
            },
            ResearchMode::Remote => {
                if let Some(groq_api_key) = &config.groq_api_key {
                    let groq = GroqClient::new(groq_api_key.clone());
                    groq.generate(
                        &format!("{}\n\n{}", SUMMARIZER_INSTRUCTIONS, human_message),
                        &config.groq_model
                    ).await?
                } else {
                    return Err(anyhow::anyhow!("Groq API key not found"));
                }
            }
        };
        
        let mut summary = response.clone();
        
        // Remove <think> tags if present
        while let (Some(start), Some(end)) = (summary.find("<think>"), summary.find("</think>")) {
            summary = format!("{}{}", &summary[..start], &summary[end + 8..]);
        }
        
        // Create JSON response with summary and structured sources
        let summary_json = serde_json::json!({
            "summary": summary.clone(),
            "sources": sources,

        });
        
        // Update the running summary in the state
        {
            let mut state_lock = state.lock().await;
            state_lock.set_running_summary(track, summary);
        }
        
        Ok(summary_json.to_string())
    }
}

#[async_trait]
impl Node for ReflectionNode {
    async fn process(&self, state: Arc<Mutex<SummaryState>>, config: &Configuration, track: &str) -> Result<String> {
        let (research_topic, track_state) = {
            let state = state.lock().await;
            (
                state.research_topic.clone(),
                state.get_track(track).clone(),
            )
        };
        
        let instructions = format_reflection_instructions(&research_topic);
        let human_message = format!(
            "Identify a knowledge gap and generate a follow-up web search query based on our existing knowledge: {}",
            track_state.running_summary
        );

        let response = match config.research_mode {
            ResearchMode::Local => {
                let ollama = Ollama::default();
                let request = GenerationRequest::new(
                    config.local_llm.clone(),
                    format!("{}\n\n{}", instructions, human_message),
                );
                ollama.generate(request).await?.response
            },
            ResearchMode::Remote => {
                if let Some(groq_api_key) = &config.groq_api_key {
                    let groq = GroqClient::new(groq_api_key.clone());
                    groq.generate(
                        &format!("{}\n\n{}", instructions, human_message),
                        &config.groq_model
                    ).await?
                } else {
                    return Err(anyhow::anyhow!("Groq API key not found"));
                }
            }
        };
        
        // Try to parse as JSON, if fails, use a fallback query
        let query = match serde_json::from_str::<Value>(&response) {
            Ok(json) => json["follow_up_query"]
                .as_str()
                .unwrap_or(&format!("Tell me more about {}", research_topic))
                .to_string(),
            Err(_) => format!("Tell me more about {}", research_topic),
        };
        
        Ok(query)
    }
}

#[async_trait]
impl Node for FinalizerNode {
    async fn process(&self, state: Arc<Mutex<SummaryState>>, _config: &Configuration, _track: &str) -> Result<String> {
        let state = state.lock().await;
        let track_one = state.get_track("one");
        let track_two = state.get_track("two");
        
        let final_summary = format!(
            "### Track One\n{}\n\n### Track One Sources:\n{}\n\n### Track Two\n{}\n\n### Track Two Sources:\n{}",
            track_one.running_summary,
            track_one.sources.join("\n"),
            track_two.running_summary,
            track_two.sources.join("\n")
        );
        
        Ok(final_summary)
    }
}

pub struct ResearchGraph {
    config: Configuration,
    status_tx: Option<Sender<StatusUpdate>>,
    nodes: Vec<Box<dyn Node>>,
}

impl ResearchGraph {
    pub fn new(config: Configuration) -> Self {
        Self {
            config,
            status_tx: None,
            nodes: vec![
                Box::new(QueryGeneratorNode),
                Box::new(WebResearchNode),
                Box::new(SummarizerNode),
                Box::new(ReflectionNode),
                Box::new(FinalizerNode),
            ],
        }
    }
    
    pub fn get_llm_model(&self) -> &str {
        &self.config.local_llm
    }

    pub fn get_max_loops(&self) -> i32 {
        self.config.max_web_research_loops
    }
    
    pub fn update_llm(&mut self, new_llm: String) {
        self.config = Configuration {
            local_llm: new_llm,
            ..self.config.clone()
        };
    }

    pub fn update_max_loops(&mut self, new_max: i32) {
        self.config = Configuration {
            max_web_research_loops: new_max,
            ..self.config.clone()
        };
    }
    
    pub fn set_status_sender(&mut self, tx: Sender<StatusUpdate>) {
        self.status_tx = Some(tx);
    }

    fn send_status(&self, phase: &str, message: &str, perspectives: Option<DebatePerspectives>) {
        if let Some(tx) = &self.status_tx {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs();

            let mut status = StatusUpdate::default();
            status.phase = phase.to_string();
            status.message = message.to_string();
            status.elapsed_time = 0.0;
            status.timestamp = now;
            status.chain_of_thought = None;
            status.track = None;
            status.perspectives = perspectives;

            match tx.send(status) {
                Ok(_) => println!("Sent status update: phase={}, message={}", phase, message),
                Err(e) => {
                    eprintln!("Failed to send status update: {} (phase={}, message={})", e, phase, message);
                }
            }
        } else {
            eprintln!("No status sender available for update: phase={}, message={}", phase, message);
        }
    }
    
    pub async fn process_research(&mut self, input: SummaryStateInput) -> Result<SummaryStateOutput> {
        let state = Arc::new(Mutex::new(SummaryState::with_research_topic(input.research_topic.clone())));

        // Generate debate perspectives first
        self.send_status("init", "Generating debate perspectives...", None);
        let perspectives = generate_debate_perspectives(&input.research_topic, &self.config).await?;
        
        // Update state with perspectives
        {
            let mut state_lock = state.lock().await;
            state_lock.set_debate_perspectives(perspectives.clone());
        }
        
        // Send status update with perspectives
        self.send_status("perspectives", "Generated debate perspectives", Some(perspectives));

        if let ResearchMode::Remote = self.config.research_mode {
            // Process both tracks in parallel using tokio::join!
            let track_one_future = self.process_track(state.clone(), "one");
            let track_two_future = self.process_track(state.clone(), "two");

            let (track_one_result, track_two_result) = tokio::join!(track_one_future, track_two_future);

            // Check results from both tracks
            track_one_result?;
            track_two_result?;

            // Generate final summary combining both perspectives
            let finalizer_node = &self.nodes[4];
            self.send_status("final", "Starting final summary compilation...", None);
            let response = finalizer_node.process(state.clone(), &self.config, "one").await?;
            self.send_status("final", "Completed final summary compilation", None);

            let mut final_state = state.lock().await;
            final_state.set_final_summary(response.clone());
            drop(final_state);
            
            self.send_status("complete", &response, None);
            
            Ok(SummaryStateOutput {
                running_summary: response,
            })
        } else {
            // Original single-track research process
            let track = "one";
            self.process_track(state.clone(), track).await?;

            let final_state = state.lock().await;
            let summary = final_state.track_one.running_summary.clone();
            
            self.send_status("complete", &summary, None);
            
            Ok(SummaryStateOutput {
                running_summary: summary,
            })
        }
    }

    pub fn update_research_mode(&mut self, mode: ResearchMode) {
        self.config = Configuration {
            research_mode: mode,
            ..self.config.clone()
        };
    }

    pub fn get_research_mode(&self) -> ResearchMode {
        self.config.research_mode.clone()
    }

    pub fn get_groq_model(&self) -> &str {
        &self.config.groq_model
    }

    async fn process_track(&self, state: Arc<Mutex<SummaryState>>, track: &str) -> Result<()> {
        let mut loop_count = 0;
        let max_loops = self.config.max_web_research_loops;

        // Initialize track with debate perspective if available
        {
            let state_lock = state.lock().await;
            if let Some(perspectives) = &state_lock.debate_perspectives {
                let initial_query = if track == "one" {
                    perspectives.perspective_one.clone()
                } else {
                    perspectives.perspective_two.clone()
                };
                drop(state_lock);
                
                let mut state_lock = state.lock().await;
                state_lock.set_search_query(track, initial_query);
                drop(state_lock);
            }
        }

        while loop_count < max_loops {
            loop_count += 1;
            self.send_status_with_track(
                "loop",
                &format!("Starting research loop {} of {} for track {}", loop_count, max_loops, track),
                None,
                Some(track),
            );

            // Web Research Phase
            let web_research_node = &self.nodes[0];
            self.send_status_with_track("research", "Starting web research...", None, Some(track));
            let response = web_research_node.process(state.clone(), &self.config, track).await?;
            self.send_status_with_track("research", "Completed web research", Some(response), Some(track));

            // Summarization Phase
            let summarizer_node = &self.nodes[1];
            self.send_status_with_track("summary", "Starting summarization...", None, Some(track));
            let response = summarizer_node.process(state.clone(), &self.config, track).await?;
            self.send_status_with_track("summary", "Completed summarization", Some(response), Some(track));

            // Reflection Phase
            let reflection_node = &self.nodes[2];
            self.send_status_with_track("reflection", "Starting reflection...", None, Some(track));
            let response = reflection_node.process(state.clone(), &self.config, track).await?;
            self.send_status_with_track("reflection", "Completed reflection", Some(response), Some(track));

            // Query Generation Phase
            let query_node = &self.nodes[3];
            self.send_status_with_track("query", "Starting query generation...", None, Some(track));
            let response = query_node.process(state.clone(), &self.config, track).await?;
            self.send_status_with_track("query", "Generated next query", Some(response), Some(track));

            // Check if we should continue
            let state_lock = state.lock().await;
            let should_continue = if track == "one" {
                state_lock.track_one.should_continue_research()
            } else {
                state_lock.track_two.should_continue_research()
            };
            drop(state_lock);

            if !should_continue {
                self.send_status_with_track(
                    "complete",
                    &format!("Research track {} completed after {} loops", track, loop_count),
                    None,
                    Some(track),
                );
                break;
            }
        }

        Ok(())
    }

    fn send_status_with_track(&self, phase: &str, message: &str, chain_of_thought: Option<String>, track: Option<&str>) {
        if let Some(tx) = &self.status_tx {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs();

            let mut status = StatusUpdate::default();
            status.phase = phase.to_string();
            status.message = message.to_string();
            status.elapsed_time = 0.0;
            status.timestamp = now;
            status.chain_of_thought = chain_of_thought;
            status.track = track.map(|t| t.to_string());
            status.perspectives = None;

            match tx.send(status) {
                Ok(_) => println!("Sent status update: phase={}, message={}, track={:?}", phase, message, track),
                Err(e) => {
                    eprintln!("Failed to send status update: {} (phase={}, message={}, track={:?})", e, phase, message, track);
                }
            }
        } else {
            eprintln!("No status sender available for update: phase={}, message={}, track={:?}", phase, message, track);
        }
    }
} 