import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
from datasets import load_dataset
import warnings
import os
import time
import shutil
import sys
import fcntl

warnings.filterwarnings("ignore", message=".*return_token_timestamps.*")
warnings.filterwarnings("ignore", message=".*forced_decoder_ids.*")

device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

model_id = "openai/whisper-large-v3"

model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True
)
model.to(device)

processor = AutoProcessor.from_pretrained(model_id)

pipe = pipeline(
    "automatic-speech-recognition",
    model=model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
    torch_dtype=torch_dtype,
    device=device,
)

RECORDINGS_DIR = "../bot/recordings"
PROCESSED_DIR = os.path.join(RECORDINGS_DIR, "processed")

os.makedirs(PROCESSED_DIR, exist_ok=True)

lock_file = open("index.lock", "w")
try:
    fcntl.lockf(lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
except IOError:
    print("Instance already running. Exiting.")
    sys.exit(1)

print(f"Monitoring {RECORDINGS_DIR} for .mp3 files...")

while True:
    try:
        files = [f for f in os.listdir(RECORDINGS_DIR) if f.endswith(".mp3")]
        
        for file_name in files:
            file_path = os.path.join(RECORDINGS_DIR, file_name)
            
            print(f"Processing {file_name}...")
            
            processing_path = file_path + ".processing"
            try:
                os.rename(file_path, processing_path)
            except OSError:
                continue

            start_time = time.time()
            try:
                result = pipe(
                    processing_path,
                    generate_kwargs={"task": "transcribe"}
                )
            except Exception as e:
                print(f"Transcription failed for {file_name}: {e}")
                try:
                    os.rename(processing_path, file_path)
                except:
                    pass
                continue
            
            end_time = time.time()
            
            text = result["text"]
            print(f"Transcription for {file_name} (took {end_time - start_time:.2f}s):")
            print(text)
            print("-" * 50)
            
            final_dest = os.path.join(PROCESSED_DIR, file_name)
            try:
                os.rename(processing_path, final_dest)
                print(f"Moved {file_name} to processed.")
            except OSError as e:
                print(f"Error moving to processed: {e}")
        
        time.sleep(1)
        
    except KeyboardInterrupt:
        print("Stopping...")
        break
    except Exception as e:
        print(f"Error in main loop: {e}")
        time.sleep(1)
