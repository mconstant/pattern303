// API client for Pattern 303 verification service

const VERIFY_API_URL = import.meta.env.VITE_VERIFY_API_URL || 'http://0.0.0.0:3001';

export interface VerifyResponse {
  success: boolean;
  message: string;
  mintAddress: string;
  collection?: string;
  error?: string;
}

/**
 * Request verification of a newly minted Pattern 303 NFT
 * This triggers the backend to verify the NFT into the collection
 */
export async function requestPatternVerification(
  mintAddress: string
): Promise<VerifyResponse> {
  try {
    const response = await fetch(`${VERIFY_API_URL}/verify-pattern`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mintAddress }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Verification request failed');
    }

    return data;
  } catch (error) {
    console.error('[VERIFY API] Request failed:', error);
    throw error;
  }
}

/**
 * Check health of verification service
 */
export async function checkVerifyServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${VERIFY_API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
