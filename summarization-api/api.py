from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(
    title="BART Summarization API",
    description="An API endpoint to summarize text using the BART model.",
    version="1.0.0"
)

# Initialize the summarization pipeline (this may download the model on first run)
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Request model
class SummarizationRequest(BaseModel):
    text: str
    max_length: int = 150  # maximum token length for the summary
    min_length: int = 30   # minimum token length for the summary

# Response model
class SummarizationResponse(BaseModel):
    summary: str

@app.post("/summarize", response_model=SummarizationResponse)
def summarize_text(request: SummarizationRequest):
    """
    Summarizes the provided text using the BART summarization model.
    """
    try:
        result = summarizer(
            request.text,
            max_length=request.max_length,
            min_length=request.min_length,
            do_sample=False
        )
        
        summary = result[0]["summary_text"]
        return SummarizationResponse(summary=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# To run the API using: uvicorn api:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
