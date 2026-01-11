# Scoring Contracts

## Goals
- Scoring is policy-bound per studio and versioned to avoid mixing.
- Evaluation inputs are schema validated with length/type limits.
- Evaluation calls are rate-limited on both IP and user dimensions.
- Evaluation logging is deterministic and avoids storing raw answers.

## Policy registry
### HumanbiologiPolicy (humanbiologi:v1)
- Studio: human
- Allowed item types: mcq, short
- Weights: mcq 0.5, short 0.5 (overall percent)
- usesRubric: false
- usesGrade: true (7-step scale)
- requiresAi: true for short answer grading
- Evaluation endpoint: POST /api/grade

### SygdomslaerePolicy (sygdomslaere:v1)
- Studio: sygdomslaere
- Allowed item types: short only
- Weights: mcq 0, short 1
- usesRubric: true (domain rubric coverage)
- usesGrade: false
- requiresAi: false (deterministic rubric scoring)
- Evaluation endpoint: POST /api/rubric-score

## Evaluation contracts
### POST /api/grade
- Input: prompt, modelAnswer, userAnswer, maxPoints, ignoreSketch, language, studio, policyId, questionKey, groupKey
- Output: score, feedback, missing, matched, model
- Constraints: studio=human, policyId=humanbiologi:v1, max lengths and ranges enforced via LIMITS

### POST /api/rubric-score
- Input: prompt, rubric, userAnswer, maxPoints, language, studio, policyId, questionKey, groupKey
- Output: score, feedback, matched, missing, rubric { matched, total, percent }
- Constraints: studio=sygdomslaere, policyId=sygdomslaere:v1, max lengths and ranges enforced via LIMITS

## Client score summary
- overallPercent, mcqPercent, shortPercent
- rubricMatched, rubricTotal, rubricPercent (only for rubric policy)
- grade (only if usesGrade)
- policyId

## Result UI mapping
- HumanbiologiPolicy: show MCQ + short breakdown and grade cards; stats labels remain Korrekte/Forkerte/Sprunget over.
- SygdomslaerePolicy: hide MCQ and grade cards; show rubric daekning card and stats labels for criteria coverage.

## Deterministic evaluation logging
- evaluation_logs stores input_hash and output_hash from stable stringify + SHA-256.
- meta records sizes and rubric/score counters for audit without raw answers.
- Log entries are scoped by RLS to the owning user.

## Rate limiting
- Both evaluation endpoints use enforceRateLimit with IP and user scopes.
