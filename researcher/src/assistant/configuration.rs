use serde::{Deserialize, Serialize};
use std::env;
use serde_json::Value;
use anyhow::Result;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SearchAPI {
    #[serde(rename = "perplexity")]
    Perplexity,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ResearchMode {
    #[serde(rename = "local")]
    Local,
    #[serde(rename = "remote")]
    Remote,
}

impl Default for ResearchMode {
    fn default() -> Self {
        ResearchMode::Local
    }
}

impl Default for SearchAPI {
    fn default() -> Self {
        SearchAPI::Perplexity
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Configuration {
    #[serde(default = "default_max_web_research_loops")]
    pub max_web_research_loops: i32,
    #[serde(default = "default_local_llm")]
    pub local_llm: String,
    #[serde(default)]
    pub search_api: SearchAPI,
    pub perplexity_api_key: String,
    #[serde(default)]
    pub research_mode: ResearchMode,
    pub groq_api_key: Option<String>,
    #[serde(default = "default_groq_model")]
    pub groq_model: String,
}

fn default_max_web_research_loops() -> i32 {
    3
}

fn default_local_llm() -> String {
    "deepseek-r1:8b".to_string()
}

fn default_groq_model() -> String {
    "mixtral-8x7b-32768".to_string()
}

impl Configuration {
    pub fn from_runnable_config(config: Option<&Value>) -> Result<Self> {
        println!("Loading configuration...");
        
        // Print current working directory and all environment variables for debugging
        println!("Current directory: {:?}", std::env::current_dir()?);
        println!("Checking environment variables...");
        
        // Check and print all relevant environment variables
        let env_vars = [
            "PERPLEXITY_API_KEY",
            "LOCAL_LLM",
            "MAX_WEB_RESEARCH_LOOPS",
            "SEARCH_API",
            "GROQ_API_KEY",
            "GROQ_MODEL",
            "RESEARCH_MODE",
        ];

        for var in env_vars.iter() {
            match env::var(var) {
                Ok(value) => println!("Found env var {}: {}", var, 
                    if var.contains("KEY") { "***".to_string() } else { value.clone() }
                ),
                Err(_) => println!("Warning: {} not found", var),
            }
        }

        let _unused = config;

        // Check each required environment variable with specific error messages
        let perplexity_api_key = env::var("PERPLEXITY_API_KEY")
            .map_err(|_| anyhow::anyhow!("PERPLEXITY_API_KEY environment variable not found - please add this to your .env file"))?;

        let local_llm = env::var("LOCAL_LLM")
            .map_err(|_| anyhow::anyhow!("LOCAL_LLM environment variable not found - please add this to your .env file"))?;

        let max_web_research_loops = env::var("MAX_WEB_RESEARCH_LOOPS")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or_else(default_max_web_research_loops);

        // Always use Perplexity as the search API
        let search_api = SearchAPI::Perplexity;

        // Get optional Groq settings
        let groq_api_key = env::var("GROQ_API_KEY").ok();
        let groq_model = env::var("GROQ_MODEL").unwrap_or_else(|_| default_groq_model());

        // Get research mode
        let research_mode = match env::var("RESEARCH_MODE").as_deref() {
            Ok("remote") => ResearchMode::Remote,
            _ => ResearchMode::Local,
        };

        Ok(Configuration {
            max_web_research_loops,
            local_llm,
            search_api,
            perplexity_api_key,
            research_mode,
            groq_api_key,
            groq_model,
        })
    }
} 