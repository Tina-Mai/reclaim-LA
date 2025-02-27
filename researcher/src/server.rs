use axum::{
    routing::{post, get, put},
    Router,
    Json,
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response, sse::{Event, Sse}},
};
use std::{
    sync::Arc,
    net::SocketAddr,
    convert::Infallible,
    time::{Duration, SystemTime, UNIX_EPOCH},
    env,
    sync::OnceLock,
};
use crate::assistant::{
    configuration::Configuration,
    state::{SummaryStateInput, StatusUpdate},
    graph::ResearchGraph,
    configuration::ResearchMode,
};
use tower_http::cors::CorsLayer;
use futures::stream::Stream;
use tokio::sync::broadcast;
use serde_json::json;
use serde::Deserialize;
use tokio::sync::Mutex;
use http::{Method, header};
use http::header::HeaderValue;

// Increase channel capacity
const CHANNEL_CAPACITY: usize = 100;

static STATUS_CHANNEL: OnceLock<broadcast::Sender<StatusUpdate>> = OnceLock::new();

fn get_status_channel() -> broadcast::Sender<StatusUpdate> {
    STATUS_CHANNEL.get_or_init(|| {
        let (tx, _) = broadcast::channel(CHANNEL_CAPACITY);
        tx
    }).clone()
}

#[derive(Clone)]
pub struct AppState {
    graph: Arc<Mutex<ResearchGraph>>,
    status_tx: broadcast::Sender<StatusUpdate>,
}

#[derive(Deserialize)]
struct ConfigUpdate {
    local_llm: Option<String>,
    max_web_research_loops: Option<i32>,
    research_mode: Option<ResearchMode>,
}

#[derive(serde::Deserialize)]
pub struct ResearchRequest {
    topic: String,
}

#[derive(serde::Serialize)]
struct ResearchResponse {
    summary: String,
    status: String,
}

// Custom error type for our API
struct ApiError(anyhow::Error);

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ResearchResponse {
                summary: format!("Error: {}", self.0),
                status: "Error occurred".to_string(),
            })
        ).into_response()
    }
}

// Convert anyhow::Error into our ApiError
impl From<anyhow::Error> for ApiError {
    fn from(err: anyhow::Error) -> Self {
        ApiError(err)
    }
}

// Add this new struct for the config response
#[derive(serde::Serialize)]
struct ConfigResponse {
    local_llm: String,
    max_web_research_loops: i32,
    research_mode: ResearchMode,
    groq_model: String,
}

pub async fn run_server(config: Configuration) {
    let status_tx = get_status_channel();
    
    let mut graph = ResearchGraph::new(config);
    graph.set_status_sender(status_tx.clone());

    let state = Arc::new(AppState {
        graph: Arc::new(Mutex::new(graph)),
        status_tx,
    });

    let frontend_origin = env::var("FRONTEND_URL")
        .unwrap_or_else(|_| "http://localhost:3000".to_string());
    
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT])
        .allow_headers([
            header::CONTENT_TYPE,
            header::ACCEPT,
            header::CACHE_CONTROL,
            header::CONNECTION,
        ])
        .allow_credentials(true)
        .allow_origin(frontend_origin.parse::<HeaderValue>().unwrap());

    let app = Router::new()
        .route("/research", post(handle_research))
        .route("/config", put(update_config))
        .route("/config", get(get_config))
        .route("/status", get(status_stream))
        .layer(cors)
        .with_state(state);

    let port = env::var("PORT").unwrap_or_else(|_| "4000".to_string()).parse::<u16>().unwrap_or(4000);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("Starting server on http://localhost:{}", port);
    println!("Allowing CORS for origin: {}", frontend_origin);
    
    axum::serve(
        tokio::net::TcpListener::bind(&addr).await.unwrap(),
        app.into_make_service(),
    )
    .await
    .unwrap();
}

async fn handle_research(
    State(state): State<Arc<AppState>>,
    Json(request): Json<ResearchRequest>,
) -> Response {
    let input = SummaryStateInput {
        research_topic: request.topic,
    };

    // Send initial status update
    let mut status = StatusUpdate::default();
    status.phase = "init".to_string();
    status.message = format!("Starting research on topic: {}", input.research_topic);
    status.timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

    if let Err(e) = state.status_tx.send(status) {
        eprintln!("Failed to send initial status update: {}", e);
    }

    let mut graph = state.graph.lock().await;
    // Update the graph's status sender
    graph.set_status_sender(state.status_tx.clone());

    match graph.process_research(input).await {
        Ok(output) => {
            // Send final status update
            let mut status = StatusUpdate::default();
            status.phase = "complete".to_string();
            status.message = output.running_summary.clone();
            status.timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

            let _ = state.status_tx.send(status);
            
            (
                StatusCode::OK,
                Json(ResearchResponse { 
                    summary: output.running_summary,
                    status: "Research completed".to_string(),
                })
            ).into_response()
        },
        Err(e) => {
            eprintln!("Research error: {:?}", e);
            let error_message = e.to_string();

            let mut status = StatusUpdate::default();
            status.phase = "error".to_string();
            status.message = format!("Error: {}", error_message);
            status.timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

            let _ = state.status_tx.send(status);
            
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ResearchResponse { 
                    summary: format!("Error: {}", error_message),
                    status: "Error occurred".to_string(),
                })
            ).into_response()
        },
    }
}

async fn status_stream(
    State(state): State<Arc<AppState>>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let mut rx = state.status_tx.subscribe();
    println!("New SSE connection established");
    
    let stream = async_stream::stream! {
        let mut retry_count = 0;
        const MAX_RETRIES: u32 = 3;
        const RETRY_DELAY: Duration = Duration::from_secs(1);

        loop {
            match rx.recv().await {
                Ok(status) => {
                    let json = serde_json::to_string(&status).unwrap();
                    println!("Sending status update: {}", json);
                    retry_count = 0; // Reset retry count on successful message
                    yield Ok(Event::default()
                        .data(json)
                        .id(status.timestamp.to_string()) // Add message ID for retry
                        .retry(Duration::from_millis(RETRY_DELAY.as_millis() as u64))); // Set retry interval using Duration
                }
                Err(e) => {
                    eprintln!("Error receiving status update: {}", e);
                    if retry_count < MAX_RETRIES {
                        retry_count += 1;
                        eprintln!("Retrying connection ({}/{})", retry_count, MAX_RETRIES);
                        // Get a fresh receiver and continue
                        rx = state.status_tx.subscribe();
                        tokio::time::sleep(RETRY_DELAY * retry_count).await;
                        continue;
                    } else {
                        eprintln!("Max retries reached, closing connection");
                        break;
                    }
                }
            }
        }
    };

    Sse::new(stream)
        .keep_alive(
            axum::response::sse::KeepAlive::new()
                .interval(Duration::from_secs(1))
                .text("keep-alive-text")
        )
}

async fn update_config(
    State(state): State<Arc<AppState>>,
    Json(update): Json<ConfigUpdate>,
) -> impl IntoResponse {
    let mut graph = state.graph.lock().await;
    
    // Send status updates
    let mut status = StatusUpdate::default();
    status.phase = "config".to_string();
    status.message = "Updating configuration...".to_string();
    status.timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

    let _ = state.status_tx.send(status);

    if let Some(llm) = update.local_llm {
        println!("Updating LLM to: {}", llm);
        graph.update_llm(llm);
    }
    
    if let Some(loops) = update.max_web_research_loops {
        println!("Updating max loops to: {}", loops);
        graph.update_max_loops(loops);
    }

    if let Some(mode) = update.research_mode {
        println!("Updating research mode to: {:?}", mode);
        graph.update_research_mode(mode);
    }
    
    (
        StatusCode::OK,
        Json(json!({
            "status": "Configuration updated",
            "message": "Changes will take effect on next research request"
        }))
    )
}

// Add this new handler function
async fn get_config(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let graph = state.graph.lock().await;
    
    (
        StatusCode::OK,
        Json(ConfigResponse {
            local_llm: graph.get_llm_model().to_string(),
            max_web_research_loops: graph.get_max_loops(),
            research_mode: graph.get_research_mode(),
            groq_model: graph.get_groq_model().to_string(),
        })
    )
} 