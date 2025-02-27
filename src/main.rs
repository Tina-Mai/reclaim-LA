use researcher::{init, Configuration};

#[tokio::main]
async fn main() {
    println!("Starting application...");
    
    // Initialize environment variables from .env
    init();
    println!("Initialized environment variables");

    // Now try to create the configuration
    match Configuration::from_runnable_config(None) {
        Ok(config) => {
            println!("Successfully loaded configuration");
            // Your research logic here
        }
        Err(e) => {
            eprintln!("Configuration error: {}", e);
        }
    }
} 