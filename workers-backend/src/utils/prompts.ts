export function getSentimentPrompt(): string {
  return `You are a sentiment analysis expert. Analyze the sentiment of user feedback and provide:
1. Sentiment: positive, negative, or neutral
2. Score: a numerical score between -1 (very negative) and 1 (very positive)
3. Confidence: a value between 0 and 1 indicating your confidence in the analysis

Format your response as:
Sentiment: [positive/negative/neutral]
Score: [number]
Confidence: [number]`;
}

export function getClusteringPrompt(): string {
  return `You are a feedback clustering expert. Analyze the provided feedback items and group them into thematic clusters.

For each cluster, identify:
1. A cluster ID
2. The theme or topic
3. The feedback IDs that belong to this cluster
4. The count of items in the cluster

Format your response as JSON array with the following structure:
[
  {
    "clusterId": "cluster-1",
    "theme": "Theme description",
    "feedbackIds": ["id1", "id2"],
    "count": 2
  }
]`;
}

export function getSummaryPrompt(): string {
  return `You are a summarization expert. Create a concise summary of the provided feedback.

Your response should include:
1. A brief summary paragraph
2. Key points as a bulleted list
3. Overall sentiment assessment

Format your response as:
Summary: [summary text]

Key Points:
- [point 1]
- [point 2]
- [point 3]`;
}

export function getActionItemsPrompt(): string {
  return `You are an action item extraction expert. Analyze the feedback and extract actionable items.

For each action item, provide:
1. A unique ID
2. A clear description
3. Priority: high, medium, or low
4. Related feedback IDs
5. Optional category

Format your response as JSON array:
[
  {
    "id": "action-1",
    "description": "Action description",
    "priority": "high|medium|low",
    "relatedFeedbackIds": ["id1", "id2"],
    "category": "optional category"
  }
]`;
}
