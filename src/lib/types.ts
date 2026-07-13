export type Language = "en" | "fr" | "es" | "pt";
export type SessionStatus =
  | "draft"
  | "generating"
  | "ready"
  | "active"
  | "grading"
  | "completed"
  | "abandoned"
  | "expired"
  | "failed";

export interface Job<T = unknown> {
  id: string;
  type: string;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  progress: number;
  result: T | null;
  error_code?: string | null;
  error_message?: string | null;
}

export interface PublicQuestion {
  index: number;
  type: "objective" | "theory" | "essay";
  topic: string;
  question: string;
  options?: Record<string, string> | null;
}

export interface SessionAnswer {
  question_index: number;
  user_answer: string;
  topic?: string;
  result?: "correct" | "incorrect" | "partial" | null;
  score?: number;
  feedback?: string | null;
  weak_area_flag?: boolean;
}

export interface Report {
  total_score: number;
  total_possible: number;
  percentage: number;
  performance_label: string;
  topic_breakdown: Array<{
    topic: string;
    correct: number;
    total: number;
    percentage: number;
  }>;
  weak_areas: string[];
  strong_areas: string[];
  wrong_answers_review: Array<{
    question_index: number;
    topic: string;
    question: string;
    user_answer: string;
    correct_answer: string;
    explanation: string;
  }>;
  motivational_note: string;
  retry_recommended: boolean;
}

export interface WebSession {
  id: string;
  status: SessionStatus;
  language: Language;
  exam: {
    raw_input: string;
    confirmed_name: string;
    governing_body: string;
    suggested_format: string;
    topics: string[];
  };
  config: {
    format: string;
    num_questions: number;
    mode: "learn" | "simulate";
    timer_seconds?: number | null;
  };
  difficulty: string;
  selected_topics: string[];
  custom_topics: string[];
  curriculum_year?: string | null;
  target_score?: number | null;
  questions: PublicQuestion[];
  answers: SessionAnswer[];
  feedback: Record<
    string,
    { correct_answer?: string; model_answer?: string; explanation?: string }
  >;
  current_question_index: number;
  flagged_question_indices: number[];
  report?: Report | null;
  generation_job_id?: string | null;
  grading_job_id?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  timer_deadline?: number | null;
  is_retry: boolean;
}

export interface AccountOverview {
  user: {
    id: string;
    email?: string;
    phone?: string;
    display_name?: string;
    plan: "free" | "pro";
    status: string;
    preferred_language: Language;
    email_verified: boolean;
    phone_verified: boolean;
    age_confirmed: boolean;
  };
  usage: { sessions: number; questions: number };
  entitlements: {
    sessions_per_month: number;
    questions_per_month: number;
    max_questions_per_session: number;
    advanced_insights: boolean;
  };
  active_session?: {
    id: string;
    status: SessionStatus;
    exam_name: string;
  } | null;
}
