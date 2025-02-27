pub mod configuration;
pub mod graph;

use dotenv::dotenv;

// Re-export main components
pub use configuration::Configuration;
pub use graph::{ResearchGraph, SummaryState, SummaryStateInput, SummaryStateOutput};

pub fn init() {
    dotenv().ok();
} 