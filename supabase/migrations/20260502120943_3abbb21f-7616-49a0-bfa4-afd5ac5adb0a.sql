
-- Quiz questions
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'easy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quiz_questions_category ON public.quiz_questions(category);
CREATE INDEX idx_quiz_questions_difficulty ON public.quiz_questions(difficulty);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view quiz questions"
  ON public.quiz_questions FOR SELECT
  USING (true);

-- Quiz results
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  breakdown JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quiz_results_created ON public.quiz_results(created_at DESC);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert quiz results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Anyone can view quiz results"
  ON public.quiz_results FOR SELECT
  USING (true);

-- Voting simulations
CREATE TABLE public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  voter JSONB NOT NULL,
  eligible BOOLEAN NOT NULL,
  eligibility_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  candidate TEXT NOT NULL,
  party TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_simulations_created ON public.simulations(created_at DESC);

ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert simulations"
  ON public.simulations FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Anyone can view own simulations"
  ON public.simulations FOR SELECT
  USING (true);

-- Chat sessions
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_sessions_session_id ON public.chat_sessions(session_id);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read chat sessions"
  ON public.chat_sessions FOR SELECT
  USING (true);
CREATE POLICY "Anyone can insert chat sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Anyone can update chat sessions"
  ON public.chat_sessions FOR UPDATE
  USING (true);

-- Seed quiz questions
INSERT INTO public.quiz_questions (question, options, correct_index, explanation, category, difficulty) VALUES
('What is the minimum age to vote in most democratic elections?', '["16","18","21","25"]'::jsonb, 1, '18 is the standard minimum voting age in most democracies.', 'eligibility', 'easy'),
('What does EVM stand for?', '["Electronic Voting Machine","Election Vote Manager","Electoral Voting Module","Elected Voter Mark"]'::jsonb, 0, 'EVM = Electronic Voting Machine.', 'process', 'easy'),
('What is the purpose of VVPAT?', '["Verify the voter''s age","Provide a paper audit trail of each vote","Count votes faster","Replace the ballot box"]'::jsonb, 1, 'VVPAT prints a slip so votes can be independently audited.', 'process', 'medium'),
('What does NOTA on a ballot mean?', '["None Of The Above","New Order To Approve","Nominee On The Ballot","No One Trusted Anywhere"]'::jsonb, 0, 'NOTA = None Of The Above.', 'process', 'easy'),
('Which body conducts national elections in India?', '["Parliament","Supreme Court","Election Commission","Ministry of Home Affairs"]'::jsonb, 2, 'The Election Commission of India conducts elections.', 'institutions', 'easy'),
('What is the Model Code of Conduct?', '["A dress code for candidates","A set of campaign and conduct guidelines during elections","A constitutional amendment","A type of ballot"]'::jsonb, 1, 'It is enforced once elections are announced to ensure free and fair polls.', 'process', 'medium'),
('What is a "constituency" in elections?', '["A type of political party","A geographic area represented by an elected official","A polling booth","An election observer"]'::jsonb, 1, 'A constituency is the geographic area an elected representative serves.', 'basics', 'easy'),
('What is a postal ballot used for?', '["Voting by mail for eligible categories","Sending election results","Mailing a Voter ID","Posting candidate manifestos"]'::jsonb, 0, 'Postal ballots allow specific eligible categories to vote by mail.', 'process', 'medium');
