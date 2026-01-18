import { RunnableSequence } from '@langchain/core/runnables';
import type { Env } from '../types/env';
import type { Feedback, SentimentAnalysisResult } from '../types/feedback';
import {
  callCloudflareAIClassification,
  callCloudflareAIChat,
  getCloudflareAIConfig
} from '../utils/cloudflareAI';

/**
 * Classify theme for a single feedback item using AI
 */
export async function classifyTheme(
  feedbackItem: Feedback,
  env: Env
): Promise<string> {
  try {
    const aiConfig = getCloudflareAIConfig(env);
    
    const themePrompt = `Analyze the following feedback and classify it into ONE of these theme categories. Choose the most appropriate category:

Categories:
- API Performance Issues (timeouts, errors, slow responses, rate limiting)
- Authentication Issues (login problems, security concerns)
- Billing UI Confusion (billing dashboard, invoice issues, payment problems)
- Customer Support Praise (positive feedback about support team)
- Dark Mode Requests (dark theme, theme preferences)
- Documentation Gaps (missing docs, unclear instructions, need examples)
- Feature Requests (new features, enhancements, improvements)
- Mobile App Bugs (mobile issues, responsive design problems)
- Performance Improvements (speed, optimization, efficiency)
- Product Praise (general positive feedback, appreciation)
- TypeScript SDK Feature Request (TypeScript support, type safety)
- Workers AI Praise (positive feedback about AI features)
- UI/UX Improvements (design, user experience, interface)
- Other (anything that doesn't fit above categories)

Feedback: "${feedbackItem.content}"

Respond with ONLY the category name (exactly as listed above, case-sensitive):`;

    const themeResponse = await callCloudflareAIChat(
      '@cf/meta/llama-3.1-8b-instruct',
      {
        messages: [
          { role: 'system', content: 'You are a feedback classification expert. Respond with only a single category name, exactly as provided in the list.' },
          { role: 'user', content: themePrompt },
        ],
      },
      aiConfig
    );

    const themeText = typeof themeResponse.content === 'string' 
      ? themeResponse.content 
      : String(themeResponse.content);
    
    // Extract theme from response (might have extra text)
    const themeMatch = themeText.match(/(API Performance Issues|Authentication Issues|Billing UI Confusion|Customer Support Praise|Dark Mode Requests|Documentation Gaps|Feature Requests|Mobile App Bugs|Performance Improvements|Product Praise|TypeScript SDK Feature Request|Workers AI Praise|UI\/UX Improvements|Other)/);
    
    if (themeMatch) {
      return themeMatch[1];
    }
    
    // Fallback: try to match partial category names
    const lowerTheme = themeText.toLowerCase().trim();
    if (lowerTheme.includes('api') || lowerTheme.includes('performance') || lowerTheme.includes('timeout') || lowerTheme.includes('error')) {
      return 'API Performance Issues';
    } else if (lowerTheme.includes('billing') || lowerTheme.includes('invoice') || lowerTheme.includes('payment')) {
      return 'Billing UI Confusion';
    } else if (lowerTheme.includes('documentation') || lowerTheme.includes('docs') || lowerTheme.includes('document')) {
      return 'Documentation Gaps';
    } else if (lowerTheme.includes('feature') || lowerTheme.includes('request') || lowerTheme.includes('add')) {
      return 'Feature Requests';
    } else if (lowerTheme.includes('mobile') || lowerTheme.includes('phone') || lowerTheme.includes('responsive')) {
      return 'Mobile App Bugs';
    } else if (lowerTheme.includes('dark') || lowerTheme.includes('theme')) {
      return 'Dark Mode Requests';
    } else if (lowerTheme.includes('typescript') || lowerTheme.includes('types')) {
      return 'TypeScript SDK Feature Request';
    } else if (lowerTheme.includes('support') || lowerTheme.includes('help')) {
      return 'Customer Support Praise';
    } else if (lowerTheme.includes('ai') || lowerTheme.includes('workers ai')) {
      return 'Workers AI Praise';
    } else if (lowerTheme.includes('praise') || lowerTheme.includes('great') || lowerTheme.includes('amazing') || lowerTheme.includes('love')) {
      return 'Product Praise';
    }
    
    return 'Other';
  } catch (error) {
    console.error('Error classifying theme:', error);
    return 'Other';
  }
}

/**
 * Analyzes sentiment of a single feedback item using LangChain and Cloudflare Workers AI
 */
export async function analyzeSentiment(
  feedbackItem: Feedback,
  env: Env
): Promise<SentimentAnalysisResult> {
  try {
    // Get config once at the start to ensure env vars are accessible
    const aiConfig = getCloudflareAIConfig(env);
    
    // Create the sentiment analysis chain using RunnableSequence
    const sentimentChain = RunnableSequence.from([
      // Step 1: Input parser - prepare the feedback content
      {
        content: (input: Feedback) => input.content,
        metadata: (input: Feedback) => JSON.stringify(input.metadata || {}),
      },
      
      // Step 2: Base sentiment classifier using distilbert (text classification model)
      async (input: { content: string; metadata: string }) => {
        // Use Cloudflare Workers AI REST API for sentiment classification
        const config = aiConfig;
        const sentimentResponse = await callCloudflareAIClassification(
          '@cf/huggingface/distilbert-sst-2-int8',
          { text: input.content },
          config
        );
        
        // Parse sentiment result - distilbert returns array of {label, score} for both POSITIVE and NEGATIVE
        let positiveScore = 0;
        let negativeScore = 0;
        let sentimentData: { label: string; score: number };
        
        if (Array.isArray(sentimentResponse)) {
          // Extract both scores
          const positive = sentimentResponse.find((item: any) => item.label === 'POSITIVE');
          const negative = sentimentResponse.find((item: any) => item.label === 'NEGATIVE');
          positiveScore = positive?.score || 0;
          negativeScore = negative?.score || 0;
          
          // Find the label with the highest score
          sentimentData = sentimentResponse.reduce((max, current) => 
            current.score > max.score ? current : max
          ) as { label: string; score: number };
        } else if (Array.isArray(sentimentResponse.data)) {
          const positive = sentimentResponse.data.find((item: any) => item.label === 'POSITIVE');
          const negative = sentimentResponse.data.find((item: any) => item.label === 'NEGATIVE');
          positiveScore = positive?.score || 0;
          negativeScore = negative?.score || 0;
          
          sentimentData = sentimentResponse.data.reduce((max, current) => 
            current.score > max.score ? current : max
          ) as { label: string; score: number };
        } else if (typeof sentimentResponse === 'object' && 'label' in sentimentResponse) {
          sentimentData = sentimentResponse as { label: string; score: number };
          positiveScore = sentimentData.label === 'POSITIVE' ? sentimentData.score : 0;
          negativeScore = sentimentData.label === 'NEGATIVE' ? sentimentData.score : 0;
        } else {
          // Fallback if format is unexpected
          sentimentData = { label: 'NEUTRAL', score: 0.5 };
          positiveScore = 0.5;
          negativeScore = 0.5;
        }
        
        // Check if scores are close (within 0.3) - indicates uncertainty/neutral sentiment
        // Also check if the highest score is below 0.7 - low confidence suggests neutral
        const scoreDifference = Math.abs(positiveScore - negativeScore);
        const maxScore = Math.max(positiveScore, negativeScore);
        const isUncertain = scoreDifference < 0.3 || maxScore < 0.7;
        
        // Map to our sentiment format
        let baseSentiment: 'positive' | 'negative' | 'neutral';
        let baseScore: number;
        
        if (isUncertain) {
          // Low confidence or close scores = neutral
          baseSentiment = 'neutral';
          baseScore = 0;
        } else {
          baseSentiment = sentimentData.label === 'POSITIVE' ? 'positive' : 
                         sentimentData.label === 'NEGATIVE' ? 'negative' : 'neutral';
          // For positive, use the score directly. For negative, negate it.
          baseScore = sentimentData.label === 'POSITIVE' ? sentimentData.score : 
                     sentimentData.label === 'NEGATIVE' ? -sentimentData.score : 0;
        }
        
        return {
          ...input,
          baseSentiment,
          baseScore,
          baseConfidence: Math.abs(sentimentData.score),
          positiveScore,
          negativeScore,
        };
      },
      
      // Step 3: Check if it's a neutral request/improvement using keyword-based detection (no LLM call to save subrequests)
      async (input: { content: string; baseSentiment: string; baseScore: number; baseConfidence: number; positiveScore: number; negativeScore: number }) => {
        const contentLower = input.content.toLowerCase();
        
        // Check for error/urgent keywords that indicate negative feedback (NOT neutral)
        const errorKeywords = ['error', 'errors', 'broken', 'down', 'crash', 'failed', 'failure', 'bug', 'bugs', 'issue', 'issues', 'problem', 'problems', 'not working', 'doesn\'t work', 'can\'t', 'cant', 'cannot', '403', '404', '500', '502', '503', '504'];
        const urgentKeywords = ['urgent', 'asap', 'immediate', 'critical', 'emergency', 'blocking', 'broken', 'not working'];
        const hasErrorKeywords = errorKeywords.some(keyword => contentLower.includes(keyword));
        const hasUrgentKeywords = urgentKeywords.some(keyword => contentLower.includes(keyword));
        
        // If it has error or urgent keywords, it's definitely NOT neutral
        if (hasErrorKeywords || hasUrgentKeywords) {
          return {
            ...input,
            isNeutralRequest: false,
          };
        }
        
        // Check for request keywords that might indicate neutral requests
        const requestKeywords = ['request', 'add', 'feature', 'support', 'need', 'would be nice', 'can you', 'please add', 'suggestion', 'improvement', 'would love', 'could you'];
        const hasRequestKeywords = requestKeywords.some(keyword => 
          contentLower.includes(keyword.toLowerCase())
        );
        
        // If sentiment is clearly positive with high confidence and no request keywords, skip neutral check
        if (input.baseSentiment === 'positive' && input.baseConfidence > 0.8 && input.baseScore > 0.7 && !hasRequestKeywords) {
          return {
            ...input,
            isNeutralRequest: false,
          };
        }
        
        // Use keyword-based detection instead of LLM to save subrequests
        // If it has request keywords (and no error/urgent keywords), it's likely a neutral request
        // Be more aggressive: if it has request keywords, classify as neutral unless it's clearly expressing strong emotion
        // Check for strong emotional language that would override neutral classification
        const strongEmotionalWords = ['love', 'amazing', 'incredible', 'fantastic', 'hate', 'terrible', 'awful', 'horrible', 'disgusting'];
        const hasStrongEmotionalLanguage = strongEmotionalWords.some(word => contentLower.includes(word));
        // If it has request keywords and no strong emotional language, treat as neutral
        const isNeutralRequest = hasRequestKeywords && !hasStrongEmotionalLanguage;
        
        return {
          ...input,
          isNeutralRequest,
        };
      },
      
      // Step 4: Combined emotion and theme detection using LLM via REST API (saves 1 API call)
      async (input: { content: string; baseSentiment: string; baseScore: number; baseConfidence: number; isNeutralRequest?: boolean }) => {
        let emotion = 'neutral';
        let theme = 'Other';
        
        try {
          // Use Cloudflare Workers AI REST API for combined emotion and theme detection
          const config = aiConfig;
          
          const combinedPrompt = `Analyze the following feedback and provide:
1. Primary emotion (ONE word): frustrated, excited, confused, angry, happy, or neutral
2. Theme category (ONE category from the list below)

Theme categories:
- API Performance Issues
- Authentication Issues
- Billing UI Confusion
- Customer Support Praise
- Dark Mode Requests
- Documentation Gaps
- Feature Requests
- Mobile App Bugs
- Performance Improvements
- Product Praise
- TypeScript SDK Feature Request
- Workers AI Praise
- UI/UX Improvements
- Other

Feedback: "${input.content}"

Respond in this exact format (one line):
emotion: [emotion word]
theme: [theme category]`;
          
          const response = await callCloudflareAIChat(
            '@cf/meta/llama-3.1-8b-instruct',
            {
              messages: [
                { role: 'system', content: 'You are an emotion and theme detection expert. Respond with emotion and theme in the exact format requested.' },
                { role: 'user', content: combinedPrompt },
              ],
            },
            config
          );
          
          const responseText = typeof response.content === 'string' 
            ? response.content 
            : String(response.content);
          
          // Parse emotion
          const emotionMatch = responseText.match(/emotion:\s*(\w+)/i);
          if (emotionMatch) {
            const detectedEmotion = emotionMatch[1].toLowerCase();
            const validEmotions = ['frustrated', 'excited', 'confused', 'angry', 'happy', 'neutral'];
            emotion = validEmotions.includes(detectedEmotion) ? detectedEmotion : 'neutral';
          }
          
          // Parse theme
          const themeMatch = responseText.match(/theme:\s*([^\n]+)/i);
          if (themeMatch) {
            theme = themeMatch[1].trim();
            // Validate theme against known categories
            const validThemes = [
              'API Performance Issues', 'Authentication Issues', 'Billing UI Confusion',
              'Customer Support Praise', 'Dark Mode Requests', 'Documentation Gaps',
              'Feature Requests', 'Mobile App Bugs', 'Performance Improvements',
              'Product Praise', 'TypeScript SDK Feature Request', 'Workers AI Praise',
              'UI/UX Improvements', 'Other'
            ];
            if (!validThemes.includes(theme)) {
              theme = 'Other';
            }
          }
        } catch (error) {
          console.error('Error detecting emotion/theme, using neutral fallback:', error);
          emotion = 'neutral';
          theme = 'Other';
        }
        
        return {
          ...input,
          emotion,
          theme,
        };
      },
      
      // Step 5: Output formatter
      (input: { 
        content: string; 
        baseSentiment: string; 
        baseScore: number; 
        baseConfidence: number; 
        emotion: string;
        theme: string;
        isNeutralRequest?: boolean;
      }): SentimentAnalysisResult => {
        // Normalize score to -1 to 1 range
        const normalizedScore = Math.max(-1, Math.min(1, input.baseScore));
        
        // Map base sentiment to final sentiment
        let finalSentiment: 'positive' | 'negative' | 'neutral';
        let finalScore = normalizedScore;
        let finalEmotion = input.emotion;
        
        const contentLower = input.content.toLowerCase();
        const positiveEmotions = ['happy', 'excited'];
        const negativeEmotions = ['angry', 'frustrated'];
        
        // Check for positive context words that indicate resolved/fixed issues
        const positiveContexts = ['resolved', 'fixed', 'solved', 'helped', 'great', 'excellent', 'amazing', 'phenomenal', 'wonderful', 'fantastic', 'perfect', 'love', 'thanks', 'thank you', 'appreciate', 'helpful', 'quick', 'fast', 'easy'];
        const hasPositiveContext = positiveContexts.some(context => contentLower.includes(context));
        
        // PRIORITY 1: If emotion is clearly positive (happy/excited), prioritize that
        // This should override error keyword detection for cases like "Issue resolved"
        if (positiveEmotions.includes(input.emotion)) {
          // If emotion is positive AND there's positive context OR positive score, it's definitely positive
          if (hasPositiveContext || normalizedScore > 0) {
            finalSentiment = 'positive';
            finalScore = Math.abs(normalizedScore) || 0.8; // Use positive score
          } else if (normalizedScore < 0) {
            // Even if distilbert says negative, if emotion is happy/excited, trust the emotion
            finalSentiment = 'positive';
            finalScore = Math.abs(normalizedScore);
          } else {
            // Neutral score but positive emotion = positive
            finalSentiment = 'positive';
            finalScore = 0.7;
          }
        }
        // PRIORITY 2: Check for error keywords - but only if emotion isn't clearly positive
        else {
          // More specific error keywords (exclude "issue" and "problem" if positive context exists)
          const errorKeywords = ['error', 'errors', 'broken', 'down', 'crash', 'failed', 'failure', 'bug', 'bugs', 'not working', 'doesn\'t work', 'can\'t', 'cant', 'cannot', '403', '404', '500', '502', '503', '504'];
          // Only check for "issue" or "problem" if there's NO positive context
          const hasIssueKeyword = !hasPositiveContext && (contentLower.includes(' issue') || contentLower.includes(' issues') || contentLower.includes(' problem') || contentLower.includes(' problems'));
          const hasErrorKeywords = errorKeywords.some(keyword => contentLower.includes(keyword)) || hasIssueKeyword;
          
          // If it has error keywords AND no positive context, it's negative
          if (hasErrorKeywords && !hasPositiveContext) {
            finalSentiment = 'negative';
            if (normalizedScore >= 0) {
              finalScore = -0.9; // Strong negative for errors
            } else {
              finalScore = normalizedScore;
            }
          }
          // If LLM detected it as a neutral request (and no errors), override to neutral
          else if (input.isNeutralRequest) {
            finalSentiment = 'neutral';
            finalScore = 0; // Neutral requests should have score of 0
            // Override emotion to neutral for requests unless it's clearly emotional
            if (!['frustrated', 'angry', 'excited', 'happy'].includes(input.emotion)) {
              finalEmotion = 'neutral';
            }
          } else if (input.baseSentiment === 'neutral') {
            // Already classified as neutral from distilbert uncertainty
            finalSentiment = 'neutral';
            finalScore = 0;
          } else {
            // Use emotion as cross-check to correct distilbert misclassifications
            // If emotion strongly suggests negative, override to negative
            if (negativeEmotions.includes(input.emotion) && normalizedScore > 0) {
              finalSentiment = 'negative';
              finalScore = -Math.abs(normalizedScore); // Use negative value
            }
            // Otherwise use distilbert classification with thresholds
            else if (normalizedScore > 0.4) {
              finalSentiment = 'positive';
            } else if (normalizedScore < -0.4) {
              finalSentiment = 'negative';
            } else {
              // Scores between -0.4 and 0.4 are neutral (wider range for improvement requests)
              finalSentiment = 'neutral';
              finalScore = 0;
            }
          }
        }
        
        // Generate reasoning
        const reasoning = `Sentiment analysis detected ${finalSentiment} sentiment (score: ${finalScore.toFixed(2)}) with ${finalEmotion} emotion. ` +
          `Confidence: ${(input.baseConfidence * 100).toFixed(0)}%.`;
        
        return {
          sentiment: finalSentiment,
          score: finalScore,
          confidence: input.baseConfidence,
          emotion: finalEmotion,
          urgency: 1, // Default urgency (kept for backward compatibility)
          reasoning,
          theme: input.theme || 'Other', // Include theme from combined detection
        };
      },
    ]);

    // Execute the chain
    const result = await sentimentChain.invoke(feedbackItem);
    
    return result;
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    
    // Return default values on error
    return {
      sentiment: 'neutral',
      score: 0,
      confidence: 0,
      emotion: 'neutral',
      urgency: 1,
      reasoning: `Error during sentiment analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Analyzes sentiment for multiple feedback items in batch
 */
export async function analyzeSentimentBatch(
  feedbackItems: Feedback[],
  env: Env
): Promise<SentimentAnalysisResult[]> {
  try {
    // Process items sequentially to avoid "Too many subrequests" error
    // Each item makes ~2-3 API calls (sentiment classification, emotion detection)
    // Cloudflare Workers free tier has 50 subrequest limit, paid has 1000
    // Process in small batches of 3-5 items to balance speed and limits
    const results: SentimentAnalysisResult[] = [];
    // Process items fully sequentially (one at a time) to stay within 50 subrequest limit
    // Each item makes ~2-3 API calls, so we can process ~15-20 items max per request
    console.log(`Starting batch analysis of ${feedbackItems.length} items sequentially`);
    
    for (let i = 0; i < feedbackItems.length; i++) {
      const item = feedbackItems[i];
      if (i % 5 === 0) {
        console.log(`Processing item ${i + 1}/${feedbackItems.length}`);
      }
      
      try {
        const result = await analyzeSentiment(item, env);
        results.push(result);
      } catch (itemError) {
        console.error(`Error processing item ${i + 1}:`, itemError);
        results.push({
          sentiment: 'neutral' as const,
          score: 0,
          confidence: 0,
          emotion: 'neutral',
          urgency: 1,
          reasoning: `Error during analysis: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`,
        });
      }
    }
    
    console.log(`Completed batch analysis: ${results.length}/${feedbackItems.length} items processed`);
    return results;
  } catch (error) {
    console.error('Error in batch sentiment analysis:', error);
    // Return default values for all items on error
    return feedbackItems.map(() => ({
      sentiment: 'neutral' as const,
      score: 0,
      confidence: 0,
      emotion: 'neutral',
      urgency: 1,
      reasoning: `Error during batch sentiment analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }));
  }
}
