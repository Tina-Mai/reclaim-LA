use anyhow::Result;
use serde_json::json;
use reqwest::Client;

pub struct GroqClient {
    api_key: String,
    client: Client,
}

impl GroqClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
        }
    }

    pub async fn generate(&self, prompt: &str, model: &str) -> Result<String> {
        let response = self.client
            .post("https://api.groq.com/openai/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&json!({
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful research assistant. Provide clear, accurate, and well-structured responses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 2048
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("Groq API error: {}", error_text));
        }

        let data = response.json::<serde_json::Value>().await?;
        
        let content = data.get("choices")
            .and_then(|choices| choices.get(0))
            .and_then(|choice| choice.get("message"))
            .and_then(|message| message.get("content"))
            .and_then(|content| content.as_str())
            .ok_or_else(|| anyhow::anyhow!("Invalid response structure from Groq API"))?;

        Ok(content.to_string())
    }
} 