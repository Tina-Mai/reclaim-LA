use anyhow::Result;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::env;
use dotenv::dotenv;

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub title: String,
    pub url: String,
    pub content: String,
    #[serde(default)]
    pub raw_content: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResponse {
    pub results: Vec<SearchResult>,
}

pub fn deduplicate_and_format_sources(
    search_response: &SearchResponse,
    max_tokens_per_source: usize,
    include_raw_content: bool,
) -> String {
    let mut unique_sources: HashMap<String, &SearchResult> = HashMap::new();
    
    // Deduplicate by URL
    for source in &search_response.results {
        unique_sources.insert(source.url.clone(), source);
    }
    
    // Format output
    let mut formatted_text = String::from("Sources:\n\n");
    for source in unique_sources.values() {
        formatted_text.push_str(&format!("Source {}:\n===\n", source.title));
        formatted_text.push_str(&format!("URL: {}\n===\n", source.url));
        formatted_text.push_str(&format!("Most relevant content from source: {}\n===\n", source.content));
        
        if include_raw_content {
            if let Some(raw_content) = &source.raw_content {
                let char_limit = max_tokens_per_source * 4;
                let truncated_content = if raw_content.len() > char_limit {
                    format!("{}... [truncated]", &raw_content[..char_limit])
                } else {
                    raw_content.clone()
                };
                formatted_text.push_str(&format!(
                    "Full source content limited to {} tokens: {}\n\n",
                    max_tokens_per_source,
                    truncated_content
                ));
            }
        }
    }
    
    formatted_text.trim().to_string()
}

pub fn format_sources(search_results: &SearchResponse) -> String {
    search_results.results
        .iter()
        .map(|source| format!("* {} : {}", source.title, source.url))
        .collect::<Vec<String>>()
        .join("\n")
}

pub async fn perplexity_search(
    query: &str,
    perplexity_search_loop_count: i32,
) -> Result<SearchResponse> {
    dotenv().ok();
    let api_key = env::var("PERPLEXITY_API_KEY")?;
    let client = Client::new();
    
    let response = client
        .post("https://api.perplexity.ai/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&serde_json::json!({
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "system",
                    "content": "Search the web and provide factual information with sources."
                },
                {
                    "role": "user",
                    "content": query
                }
            ]
        }))
        .send()
        .await?;
        
    let data: Value = response.json().await?;
    let content = data["choices"][0]["message"]["content"].as_str()
        .ok_or_else(|| anyhow::anyhow!("Failed to get content from response"))?;
        
    // Create a Vec that will live for the entire function
    let citations_vec = data.get("citations")
        .and_then(|c| c.as_array())
        .map(|arr| arr.to_vec())
        .unwrap_or_default();
        
    let mut results = vec![SearchResult {
        title: format!("Perplexity Search {}, Source 1", perplexity_search_loop_count + 1),
        url: citations_vec.first()
            .and_then(|c| c.as_str())
            .unwrap_or("https://perplexity.ai")
            .to_string(),
        content: content.to_string(),
        raw_content: Some(content.to_string()),
    }];
    
    // Add additional citations
    for (i, citation) in citations_vec.iter().skip(1).enumerate() {
        if let Some(url) = citation.as_str() {
            results.push(SearchResult {
                title: format!("Perplexity Search {}, Source {}", perplexity_search_loop_count + 1, i + 2),
                url: url.to_string(),
                content: "See above for full content".to_string(),
                raw_content: None,
            });
        }
    }
    
    Ok(SearchResponse { results })
} 