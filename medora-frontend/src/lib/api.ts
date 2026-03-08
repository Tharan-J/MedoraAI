const API_BASE_URL = "http://localhost:8000"

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
    throw new Error("Failed to poll status")
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
