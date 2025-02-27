pub const QUERY_WRITER_INSTRUCTIONS: &str = r#"You are a research assistant tasked with generating effective search queries.
Your goal is to create a search query that will help gather relevant information about the research topic.
Format your response as JSON with a single key 'query' containing the search query."#;

pub const SUMMARIZER_INSTRUCTIONS: &str = r#"You are a research assistant tasked with summarizing information.
Analyze the search results and create a comprehensive summary that addresses the research topic.
If there's an existing summary, integrate the new information with it."#;

pub const REFLECTION_INSTRUCTIONS: &str = r#"You are a research assistant tasked with identifying knowledge gaps.
Analyze the current summary and identify what important aspects of {research_topic} still need to be explored.
Generate a follow-up search query to fill these gaps.
Format your response as JSON with a single key 'follow_up_query' containing the search query."#;

pub fn format_query_writer_instructions(research_topic: &str) -> String {
    QUERY_WRITER_INSTRUCTIONS.replace("{research_topic}", research_topic)
}

pub fn format_reflection_instructions(research_topic: &str) -> String {
    REFLECTION_INSTRUCTIONS.replace("{research_topic}", research_topic)
} 