const SUPABASE_URL = 'https://wzvonmurvjpzjzjuufrl.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Hm_2NtahEHnH2UxhthCPUw_KeBYSsq2'

export class Logger {
  public static log(data: {
    padlock_id: string,
    difficulty: number,
    solution_count: number,
    elapsed_seconds: number,
    number_of_hints_used: number,
  }): void {
    fetch(`${SUPABASE_URL}/rest/v1/logs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).catch(error => console.error('Failed to log to Supabase', error))
  }
}
