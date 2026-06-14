import { doc, getDoc, collection, getDocs, Firestore } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import { getGeminiClient } from './lib/gemini.js';

export interface DocumentChunk {
  id: string;
  source: string;
  title?: string;
  content: string;
  embedding?: number[];
}

// Global In-Memory Store for Vector Index
let vectorIndex: DocumentChunk[] = [];
let hasBeenIndexed = false;

// Fallback high-fidelity content corpus matching Sankalp's real profile
const FALLBACK_CORPUS = [
  {
    id: 'bio_about',
    source: 'about',
    title: 'About Sankalp Suman - Bio and Leadership Focus',
    content: `Sankalp Suman is a results-driven QA Lead & Software Test Specialist with 7+ years of professional software testing experience. He currently works as a Software Test Specialist and Scrum Master at Amdocs. His unique background includes being a UPSC Civil Services Aspirant with Sociology as an optional subject, demonstrating wide intellectual depth, extreme discipline, high leadership caliber, and sociological understanding of organizations/processes. He specializes in AI-powered testing, manual and automated regression suites, API validation, Agile Scrum, and bridging the gap between QA automation and agentic generative intelligence.`
  },
  {
    id: 'career_goals',
    source: 'goals',
    title: 'Career Goals and Relocation readiness',
    content: `Sankalp Suman is open to exciting software QA, testing, and quality engineering leadership opportunities globally, including India 🇮🇳, the USA 🇺🇸, Germany 🇩🇪, and other global tech hubs. He has ready availability for remote/hybrid positions or relocation, and is highly interested in roles involving advanced test automation, AI-Assisted QA, and Scrum Master agile ceremonies.`
  },
  {
    id: 'exp_amdocs',
    source: 'experience',
    title: 'Experience at Amdocs',
    content: `Amdocs (Dec 2021 – Present): Software Test Specialist & Scrum Master at Gurgaon, India. Leading QA delivery for enterprise-scale telecom platforms. Implementing AI-assisted testing workflows and managing Agile sprints as Scrum Master. Succeeded in increasing delivery speed and test case efficiency.`
  },
  {
    id: 'exp_hexaview',
    source: 'experience',
    title: 'Experience at Hexaview (Adobe Client)',
    content: `Hexaview - Adobe Client (Jun 2019 – Dec 2021): Senior Quality Engineer. Focused on complex software validation for Adobe products. Built automated testing frameworks, reduced regression cycle execution duration, and optimized test suites.`
  },
  {
    id: 'exp_opkey',
    source: 'experience',
    title: 'Experience at Opkey',
    content: `Opkey (Aug 2018 – May 2019): Quality Engineer. Manual and automated testing for cloud platforms. Contributed to early-stage test case generation logic, API reliability, and black-box validations.`
  },
  {
    id: 'skill_ai_qa',
    source: 'skills',
    title: 'Skills - AI in QA',
    content: `Advanced tech skills: AI-driven testing (95% expertise), prompt engineering (90%), integrating LLMs into software quality assurance processes, and building agentic AI QA pipelines to automate manual test planning.`
  },
  {
    id: 'skill_testing',
    source: 'skills',
    title: 'Skills - Core Testing & Automation',
    content: `Core expertise: Manual and functional testing, API physical validation (Postman, REST Assured) with 92% expertise, automated GUI automation using Selenium Webdriver with Java/Python, Playwright, ETL testing, SQL database testing, JIRA, and Test Planning.`
  },
  {
    id: 'skill_scrum',
    source: 'skills',
    title: 'Skills - Leadership & Scrum',
    content: `Methodology experience: Scrum Master Leadership (90%), managing Agile sprints, hosting standups, retrospectives, organizing backlog grooming sessions, resolving cross-team dependencies, and managing test plan risks.`
  },
  {
    id: 'proj_tc_gen',
    source: 'projects',
    title: 'Project: AI Test Case Generator Agent',
    content: `Project AI Test Case Generator: An autonomous QA agent that extracts detailed test scenarios and step-by-step test execution cases directly from natural-language product documentation with 95% accuracy. Built using Python, Gemini API, Selenium, and React.`
  },
  {
    id: 'proj_resume_morph',
    source: 'projects',
    title: 'Project: Resume Morph AI',
    content: `Project Resume Morph AI: A dynamic portfolio application that automatically adapts and prioritizes portfolio content based on the target job description or recruiter requirements using LLMs and advanced prompt engineering. Built with Next.js, OpenAI, Tailwind, and Firebase.`
  },
  {
    id: 'proj_copilot_dash',
    source: 'projects',
    title: 'Project: QA Copilot Dashboard',
    content: `Project QA Copilot Dashboard: A real-time monitoring dashboard for automated test execution that features AI-driven defect analysis, pattern categorization, and auto root-cause detection of failing test scripts. Developed with Node.js, D3.js, MongoDB, and LangChain.`
  },
  {
    id: 'cert_istqb',
    source: 'certifications',
    title: 'ISTQB Certified Tester Accolade',
    content: `Accreditation: ISTQB Certified Tester issued by the International Software Testing Qualifications Board (ISTQB) in 2019, confirming deep knowledge of software quality methodologies, functional verification, and defect lifecycles.`
  },
  {
    id: 'cert_csm',
    source: 'certifications',
    title: 'Scrum Master Certified',
    content: `Professional Certification: Certified Scrum Master (CSM) issued by the Scrum Alliance in 2021, verifying credentials in Agile delivery practices, sprint backlog planning, risk management, and scrum coaching.`
  },
  {
    id: 'contact_info',
    source: 'contact',
    title: 'Contact Information & Links',
    content: `Contact details: Email is sankalpsmn@gmail.com, Location is Gurgaon / Delhi NCR, India, LinkedIn profile URL is linkedin.com/in/sankalp-suman. To schedule meetings or interviews, please use the floating 'Book Interview' action in the chatbot or the scheduler on the website.`
  },
  {
    id: 'now_focus',
    source: 'now',
    title: 'Focused on Currently',
    content: `Sankalp is currently focused on leading Amdocs' QA acceleration by compiling and integrating Agentic workflows into the Software Testing Life Cycle (STLC). This bridges traditional test automation with Generative AI tools, driving 40% faster product delivery. He is also actively preparing for global relocations in response to career opportunities.`
  }
];

// Vector math utilities
function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, idx) => sum + val * (b[idx] || 0), 0);
}

function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

/**
 * Builds the searchable Document Chunks by pulling from Firestore AND merging with baseline configs.
 */
export async function buildKnowledgeBase(db: Firestore | null, ai?: GoogleGenAI): Promise<void> {
  console.log('[RAG] Indexing portfolio documents into vector database...');
  const activeAi = ai || getGeminiClient();
  
  const chunks: DocumentChunk[] = [];

  // Helper to safely format array metrics
  const formatMetrics = (metricsArray: any[]): string => {
    if (!Array.isArray(metricsArray)) return '';
    return metricsArray.map(m => `- ${m.label || m.name}: ${m.value || m.level || ''}`).join('\n');
  };

  // 1. Core Dynamic Loaders from Firestore
  if (db) {
    try {
      // Load Singletons
      const [aboutSnap, heroSnap, contactSnap, nowSnap, aiSnap] = await Promise.all([
        getDoc(doc(db, 'about/content')),
        getDoc(doc(db, 'hero/content')),
        getDoc(doc(db, 'contact/info')),
        getDoc(doc(db, 'now/content')),
        getDoc(doc(db, 'ai/content'))
      ]);

      if (aboutSnap.exists()) {
        const d = aboutSnap.data();
        chunks.push({
          id: 'firestore_about',
          source: 'about',
          title: 'Engineering Excellence - About Me Section',
          content: `${d.content || ''}\nMetrics details:\n${formatMetrics(d.metrics)}`
        });
      }

      if (heroSnap.exists()) {
        const d = heroSnap.data();
        chunks.push({
          id: 'firestore_hero',
          source: 'hero',
          title: 'Hero / Title Showcase',
          content: `Sankalp Suman Headline: ${d.headline || ''}. Professional Titles: ${(d.titles || []).join(', ')}. Career Description Summary: ${d.description || ''}. Resume Link: ${d.resumeUrl || ''}, LinkedIn: ${d.linkedinUrl || ''}, GitHub: ${d.githubUrl || ''}`
        });
      }

      if (contactSnap.exists()) {
        const d = contactSnap.data();
        chunks.push({
          id: 'firestore_contact',
          source: 'contact',
          title: 'Contact Details',
          content: `Full Name: ${d.name || 'Sankalp Suman'}. Business Email: ${d.email || 'sankalpsmn@gmail.com'}. Office Phone: ${d.phone || ''}. Business Location: ${d.location || 'Gurgaon, India'}. professional LinkedIn: ${d.linkedin || ''}`
        });
      }

      if (nowSnap.exists()) {
        const d = nowSnap.data();
        chunks.push({
          id: 'firestore_now',
          source: 'now',
          title: 'What Sankalp Suman is doing right now',
          content: `Focused right now: ${d.content || ''}. Information was last updated at ${d.lastUpdated || 'recently'}`
        });
      }

      if (aiSnap.exists()) {
        const d = aiSnap.data();
        chunks.push({
          id: 'firestore_ai_qa',
          source: 'ai_architecture',
          title: 'AI in Quality Assurance Strategy',
          content: `AI QA Headline: ${d.headline || ''}. Subheading: ${d.subheadline || ''}. Efficiency metrics: ${d.efficiency || ''}. Code quality reliability: ${d.reliability || ''}. Step methods:\n${(d.steps || []).map((s: any) => `${s.title}: ${s.desc}`).join('\n')}`
        });
      }

      // Load Collections in parallel
      const [expSnap, skillsSnap, projSnap, certSnap, blogsSnap, storiesSnap] = await Promise.all([
        getDocs(collection(db, 'experience')),
        getDocs(collection(db, 'skills')),
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'certifications')),
        getDocs(collection(db, 'blogs')),
        getDocs(collection(db, 'impactStories'))
      ]);

      expSnap.forEach(docSnap => {
        const d = docSnap.data();
        chunks.push({
          id: `firestore_exp_${docSnap.id}`,
          source: 'experience',
          title: `Work Experience at ${d.company}`,
          content: `Company: ${d.company}. Job Role: ${d.role}. Timeline Period: ${d.period}. Job Description and Accomplishments:\n${d.description || ''}. Key technologies and keywords: ${(d.tags || []).join(', ')}`
        });
      });

      skillsSnap.forEach(docSnap => {
        const d = docSnap.data();
        chunks.push({
          id: `firestore_skill_${docSnap.id}`,
          source: 'skills',
          title: `Technical skill: ${d.name}`,
          content: `Technical Skill: ${d.name} classified in Category: ${d.category} with internal proficiency score: ${d.level || 90}%`
        });
      });

      projSnap.forEach(docSnap => {
        const d = docSnap.data();
        chunks.push({
          id: `firestore_proj_${docSnap.id}`,
          source: 'projects',
          title: `Project: ${d.title}`,
          content: `Project Name: ${d.title}. Detailed Description: ${d.description}. Technological Stack: ${(d.techStack || []).join(', ')}. Deployment Live URL: ${d.liveUrl || ''}. Codebase Repository Link: ${d.githubUrl || ''}`
        });
      });

      certSnap.forEach(docSnap => {
        const d = docSnap.data();
        chunks.push({
          id: `firestore_cert_${docSnap.id}`,
          source: 'certifications',
          title: `Professional Credential: ${d.name}`,
          content: `Accreditation Name: ${d.name} officially issued by Authority: ${d.issuer} on Date: ${d.date}. Link or credential record: ${d.url || ''}`
        });
      });

      blogsSnap.forEach(docSnap => {
        const d = docSnap.data();
        if (d.status === 'published') {
          chunks.push({
            id: `firestore_blog_${docSnap.id}`,
            source: 'blogs',
            title: `Blog Post: ${d.title}`,
            content: `Blog Title: ${d.title}. Blog Excerpt: ${d.excerpt || ''}. Rich Content:\n${d.content || ''}. Keywords/Tags: ${(d.tags || []).join(', ')}. Category: ${d.category || ''}`
          });
        }
      });

      storiesSnap.forEach(docSnap => {
        const d = docSnap.data();
        chunks.push({
          id: `firestore_story_${docSnap.id}`,
          source: 'impact_stories',
          title: `QA Impact Case Study: ${d.title}`,
          content: `Case Study: ${d.title}. Root Problem: ${d.problem}. Implemented Engineering Solution: ${d.solution}. QA Quality Tools Used: ${(d.tools || []).join(', ')}. Hard metrics: ${(d.metrics || []).join(', ')}. Comprehensive Business Impact: ${d.impact}`
        });
      });

    } catch (e) {
      console.warn('[RAG] Firestore load encountered warnings, relying on secure fallbacks:', e);
    }
  } else {
    console.warn('[RAG] No active Firestore connection, building baseline knowledge-base form defaults.');
  }

  // 2. Blend/Merge with Fallbacks to prevent gaps in QA representation
  for (const item of FALLBACK_CORPUS) {
    const isDuplicate = chunks.some(c => c.id.replace('firestore_', '') === item.id.replace('bio_about', 'about').replace('contact_info', 'contact').replace('now_focus', 'now'));
    if (!isDuplicate) {
      chunks.push({
        id: item.id,
        source: item.source,
        title: item.title,
        content: item.content
      });
    }
  }

  // 3. Optimize Embeddings generation - lazy compile embedding arrays to avoid rate limits
  // We populate our in-memory vector index, conserving existing matching vector scores from previous indices!
  const oldVectorMap = new Map<string, number[]>();
  for (const oldDoc of vectorIndex) {
    if (oldDoc.embedding) {
      oldVectorMap.set(oldDoc.id, oldDoc.embedding);
    }
  }

  console.log(`[RAG] Total of ${chunks.length} chunks defined for the portfolio indexing.`);

  // Generate embeddings for new or modified content in parallel batches to prevent Vercel timeouts
  const batchSize = 5;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    await Promise.all(batch.map(async (chunk) => {
      const cachedEmbedding = oldVectorMap.get(chunk.id);
      if (cachedEmbedding && cachedEmbedding.length > 0) {
        chunk.embedding = cachedEmbedding;
      } else {
        try {
          const textToEmbed = `Title: ${chunk.title || ''}\nContent: ${chunk.content}`;
          // Generate embedding with gemini-embedding-2-preview model using GoogleGenAI unified SDK
          const response = await activeAi.models.embedContent({
            model: 'gemini-embedding-2-preview',
            contents: textToEmbed,
          }) as any;

          // Ensure safe extraction of embedding values
          const vals = response.embedding?.values || response.embeddings?.[0]?.values || response.values;
          if (Array.isArray(vals)) {
            chunk.embedding = vals as number[];
          } else {
            console.warn(`[RAG] Embedding response format unknown for chunk ${chunk.id}:`, response);
          }
        } catch (err) {
          console.error(`[RAG] Failed to generate vector embedding for chunk ${chunk.id}:`, err);
        }
      }
    }));
  }

  // Update Global Index
  vectorIndex = chunks;
  hasBeenIndexed = true;
  console.log(`[RAG] Vector Search pipeline indexed successfully with ${vectorIndex.filter(v => v.embedding).length}/${vectorIndex.length} semantic vectors!`);
}

/**
 * Searches the vector DB for the closest matching portfolio content for a given question.
 * Returns up to maxResults matches sorted by cosine relevance.
 */
export async function retrieveRelevantContext(queryText: string, ai: GoogleGenAI | null | undefined, db: Firestore | null, maxResults = 4): Promise<string> {
  const activeAi = ai || getGeminiClient();
  // If not initially indexed, execute indexing first
  if (!hasBeenIndexed || vectorIndex.length === 0) {
    await buildKnowledgeBase(db, activeAi);
  }

  if (vectorIndex.length === 0) {
    return 'No portfolio documentation currently available.';
  }

  try {
    // Generate embedding vector for the question
    const response = await activeAi.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: queryText,
    }) as any;

    const queryEmbedding = response.embedding?.values || response.embeddings?.[0]?.values || response.values;
    
    if (!Array.isArray(queryEmbedding)) {
      throw new Error('Query embedding generation failed');
    }

    // Rank chunks by similarity
    const rankedChunks = vectorIndex
      .filter(chunk => chunk.embedding && chunk.embedding.length > 0)
      .map(chunk => {
        const score = cosineSimilarity(queryEmbedding, chunk.embedding!);
        return { chunk, score };
      })
      .sort((a, b) => b.score - a.score);

    // Pick top K closest documents
    const matches = rankedChunks.slice(0, maxResults);
    
    console.log(`[RAG] Top vector search matches for query "${queryText}":`);
    matches.forEach(m => {
      console.log(`  - Similarity: ${(m.score * 100).toFixed(1)}% [${m.chunk.id}] -> ${m.chunk.title}`);
    });

    // Collate matches into structured context text block
    const mergedContext = matches.map(m => {
      return `--- PORTFOLIO SECTION: ${m.chunk.title || 'Untitled Section'} (Relevance Match: ${(m.score * 100).toFixed(0)}%) ---\n${m.chunk.content}`;
    }).join('\n\n');

    return mergedContext;

  } catch (error) {
    console.warn('[RAG] Fallback to natural keyword search because embeddings matching failed:', error);
    // Standard Keyword-based search fallback in case API is offline
    const queryWords = queryText.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    const lexicalMatches = vectorIndex.map(chunk => {
      let score = 0;
      const textToSearch = `${chunk.title || ''} ${chunk.content}`.toLowerCase();
      for (const word of queryWords) {
        if (textToSearch.includes(word)) score += 1;
      }
      return { chunk, score };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

    if (lexicalMatches.length > 0) {
      return lexicalMatches.map(m => `--- PORTFOLIO SECTION: ${m.chunk.title || 'Untitled Section'} ---\n${m.chunk.content}`).join('\n\n');
    }

    // Ultimate fallback: merge a subset of basic info
    return vectorIndex.slice(0, 3).map(chunk => `--- SECTION: ${chunk.title} ---\n${chunk.content}`).join('\n\n');
  }
}

/**
 * Triggers re-indexing of the portfolio knowledge base (e.g., when dynamic backend configs change)
 */
export async function invalidateRAGCache(): Promise<void> {
  console.log('[RAG] Invalidating cache and resetting index flags...');
  hasBeenIndexed = false;
}
