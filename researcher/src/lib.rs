pub mod assistant;
pub mod server;

pub use assistant::configuration::Configuration;
pub use assistant::graph::ResearchGraph;
pub use assistant::state::{SummaryState, SummaryStateInput, SummaryStateOutput};

use dotenv::dotenv;

pub fn init() {
    dotenv().ok();
} 