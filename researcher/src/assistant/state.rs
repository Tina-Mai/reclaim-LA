use serde::{Deserialize, Serialize};
use super::debate::DebatePerspectives;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchTrack {
    pub search_query: String,
    pub research_loop_count: usize,
    pub running_summary: String,
    pub sources: Vec<String>,
    pub web_research_results: Vec<String>,
}

impl ResearchTrack {
    pub fn new() -> Self {
        Self {
            search_query: String::new(),
            research_loop_count: 0,
            running_summary: String::new(),
            sources: Vec::new(),
            web_research_results: Vec::new(),
        }
    }

    pub fn should_continue_research(&self) -> bool {
        // Continue if either:
        // 1. We haven't started yet (no summary or results)
        // 2. We have meaningful content and haven't reached diminishing returns
        (self.running_summary.is_empty() && self.web_research_results.is_empty()) ||
        (!self.running_summary.is_empty() && self.web_research_results.len() > 0 && self.research_loop_count < 3)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SummaryState {
    pub research_topic: String,
    pub track_one: ResearchTrack,
    pub track_two: ResearchTrack,
    pub final_summary: Option<String>,
    pub debate_perspectives: Option<DebatePerspectives>,
}

impl SummaryState {
    pub fn with_research_topic(topic: String) -> Self {
        Self {
            research_topic: topic,
            track_one: ResearchTrack::new(),
            track_two: ResearchTrack::new(),
            final_summary: None,
            debate_perspectives: None,
        }
    }

    pub fn set_debate_perspectives(&mut self, perspectives: DebatePerspectives) {
        self.debate_perspectives = Some(perspectives);
    }

    pub fn get_track(&self, track: &str) -> &ResearchTrack {
        match track {
            "one" => &self.track_one,
            "two" => &self.track_two,
            _ => &self.track_one, // Default to track one
        }
    }

    pub fn get_track_mut(&mut self, track: &str) -> &mut ResearchTrack {
        match track {
            "one" => &mut self.track_one,
            "two" => &mut self.track_two,
            _ => &mut self.track_one, // Default to track one
        }
    }

    pub fn set_search_query(&mut self, track: &str, query: String) {
        self.get_track_mut(track).search_query = query;
    }

    pub fn increment_loop_count(&mut self, track: &str) {
        let track = self.get_track_mut(track);
        track.research_loop_count += 1;
    }

    pub fn add_source(&mut self, track: &str, source: String) {
        self.get_track_mut(track).sources.push(source);
    }

    pub fn add_web_research_result(&mut self, track: &str, result: String) {
        self.get_track_mut(track).web_research_results.push(result);
    }

    pub fn set_running_summary(&mut self, track: &str, summary: String) {
        self.get_track_mut(track).running_summary = summary;
    }

    pub fn set_final_summary(&mut self, summary: String) {
        self.final_summary = Some(summary);
    }
}

#[derive(Debug, Clone)]
pub struct SummaryStateInput {
    pub research_topic: String,
}

#[derive(Debug, Clone)]
pub struct SummaryStateOutput {
    pub running_summary: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct StatusUpdate {
    pub phase: String,
    pub message: String,
    pub elapsed_time: f64,
    pub timestamp: u64,
    pub chain_of_thought: Option<String>,
    pub track: Option<String>,
    pub perspectives: Option<DebatePerspectives>,
}

impl Default for StatusUpdate {
    fn default() -> Self {
        Self {
            phase: String::new(),
            message: String::new(),
            elapsed_time: 0.0,
            timestamp: 0,
            chain_of_thought: None,
            track: None,
            perspectives: None,
        }
    }
} 