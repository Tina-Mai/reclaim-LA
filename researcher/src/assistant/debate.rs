use serde::{Deserialize, Serialize};
use anyhow::Result;
use super::configuration::{Configuration, ResearchMode};
use ollama_rs::Ollama;
use ollama_rs::generation::completion::request::GenerationRequest;
use crate::assistant::groq::GroqClient;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebatePerspectives {
    pub topic: String,
    pub perspective_one: String,
    pub perspective_two: String,
}

const DEBATE_PROMPT: &str = r#"You are a debate coach helping to frame different perspectives on a topic.
Given this research topic, generate two distinct, well-reasoned perspectives that could form the basis of a debate.
Each perspective should be factual, balanced, and supported by evidence.

Research Topic: {topic}

Format your response as a JSON object with these exact keys:
{{
    "topic": "the research topic",
    "perspective_one": "first perspective",
    "perspective_two": "second perspective"
}}

Ensure all quotes and special characters in the perspectives are properly escaped."#;

pub async fn generate_debate_perspectives(topic: &str, config: &Configuration) -> Result<DebatePerspectives> {
    let prompt = DEBATE_PROMPT.replace("{topic}", topic);
    
    let response = match config.research_mode {
        ResearchMode::Local => {
            let ollama = Ollama::default();
            let request = GenerationRequest::new(config.local_llm.clone(), prompt);
            ollama.generate(request).await?.response
        },
        ResearchMode::Remote => {
            if let Some(groq_api_key) = &config.groq_api_key {
                let groq = GroqClient::new(groq_api_key.clone());
                groq.generate(&prompt, &config.groq_model).await?
            } else {
                return Err(anyhow::anyhow!("Groq API key not found"));
            }
        }
    };

    // Extract JSON from response by finding the first '{' and last '}'
    let json_start = response.find('{').unwrap_or(0);
    let json_end = response.rfind('}').map(|i| i + 1).unwrap_or(response.len());
    let json_str = &response[json_start..json_end];

    // Parse the response, ensuring proper JSON escaping
    match serde_json::from_str::<DebatePerspectives>(json_str) {
        Ok(perspectives) => Ok(perspectives),
        Err(e) => {
            eprintln!("Failed to parse debate perspectives: {}", e);
            eprintln!("Raw response: {}", response);
            Err(anyhow::anyhow!("Failed to parse debate perspectives: {}", e))
        }
    }
} 