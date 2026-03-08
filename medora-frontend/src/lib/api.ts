const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://medora-ai.onrender.com"

export async function uploadAudio(file: File, patientName = "Anonymous") {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("patient_name", patientName)

  const response = await fetch(`${API_BASE_URL}/upload_audio`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Upload failed")
  }

  return response.json() // { job_id, status, filename }
}

export async function generateNote(jobId: string) {
  const response = await fetch(`${API_BASE_URL}/generate_note?job_id=${jobId}`, {
    method: "POST",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Failed to start note generation")
  }

  return response.json() // { job_id, status }
}

export async function pollStatus(jobId: string) {
  const response = await fetch(`${API_BASE_URL}/status/${jobId}`)
  if (!response.ok) {
    throw new Error(`Status check failed (HTTP ${response.status})`)
  }
  return response.json() // { job_id, status, result, error }
}

export async function getAnalytics() {
  const response = await fetch(`${API_BASE_URL}/analytics`)
  if (!response.ok) {
    throw new Error("Failed to fetch analytics")
  }
  return response.json()
}

/**
 * Poll until status is "completed" or "failed".
 * Retries up to maxAttempts times with intervalMs between each.
 * Handles transient network errors and 404s gracefully (Render cold starts).
 */
export async function pollUntilDone(
  jobId: string,
  onProgress?: (attempt: number) => void,
  intervalMs = 4000,
  maxAttempts = 90        // 90 × 4s = 6 minutes max wait
): Promise<{ status: string; result: any; error?: string }> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, intervalMs))
    onProgress?.(attempt)

    try {
      const data = await pollStatus(jobId)

      if (data.status === "completed") return data
      if (data.status === "failed") return data

      // still processing — keep waiting
    } catch (err: any) {
      // Transient errors (Render cold start 404, network blip) — keep retrying
      console.warn(`Poll attempt ${attempt} failed: ${err.message}`)
    }
  }

  return {
    status: "failed",
    result: null,
    error: "Processing timed out after 6 minutes. The server may be overloaded — please try again.",
  }
}
