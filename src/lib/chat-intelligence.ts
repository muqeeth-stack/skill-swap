import { User, SkillExchangeOffer } from "@/types";

export interface PeerChatContext {
  targetUser: User;
  currentUser: User;
  messageText: string;
  previousMessages?: { text: string; senderId: string }[];
  activeOffer?: SkillExchangeOffer;
}

/**
 * Intelligent persona-driven reply generator for peer skill barter chat.
 * Mimics authentic, conversational, in-character replies tailored to each user's
 * background, taught skills, and exchange goals.
 */
export function generatePeerResponse(context: PeerChatContext): string {
  const { targetUser, currentUser, messageText, activeOffer } = context;
  const lower = messageText.toLowerCase();

  const targetTeachSkill = activeOffer?.teachSkill || targetUser.skillsTeach[0]?.name || "Skills";
  const targetLearnSkill = activeOffer?.learnSkill || targetUser.skillsLearn[0]?.name || "New Skills";
  const currentTeachSkill = currentUser.skillsTeach[0]?.name || targetLearnSkill;

  // 1. Barter / Trade Proposal Responses
  if (
    lower.includes("barter") ||
    lower.includes("propose") ||
    lower.includes("trade") ||
    lower.includes("proceed with our skill exchange") ||
    lower.includes("accepted your barter offer")
  ) {
    const responses = [
      `Hey ${currentUser.name}! That sounds fantastic. I've been really eager to learn more ${currentTeachSkill}, and I'd love to coach you through ${targetTeachSkill} in return. What does your schedule look like this week?`,
      `Hi ${currentUser.name}! I'm 100% in for this exchange. Your background in ${currentTeachSkill} is exactly what I need. Shall we do 45-minute sessions once a week? Let me know which days suit you best!`,
      `Thanks for reaching out ${currentUser.name}! I would love to trade ${targetTeachSkill} coaching for ${currentTeachSkill} sessions. Are you free for an initial 30m kickoff this weekend?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 2. Schedule / Availability / Weekend / Timeslot Responses
  if (
    lower.includes("schedule") ||
    lower.includes("weekend") ||
    lower.includes("saturday") ||
    lower.includes("sunday") ||
    lower.includes("tomorrow") ||
    lower.includes("free") ||
    lower.includes("time") ||
    lower.includes("available") ||
    lower.includes("meet")
  ) {
    const responses = [
      `Saturday around 3:00 PM UTC or Sunday mornings work best for me. You can click '📅 Book Session' in the chat header to lock in a time that works for you, and it'll sync right into our calendar!`,
      `I'm available tomorrow afternoon or this coming Saturday! A 45-minute kickoff would be perfect to align on our roadmap. What time zone are you based in?`,
      `Weekends are great for me! How about Saturday at 4:00 PM? We can hop into the Synapse live video room and do our first 1-on-1 barter session.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 3. Syllabus / Curriculum / Prerequisites / Experience
  if (
    lower.includes("syllabus") ||
    lower.includes("curriculum") ||
    lower.includes("teach") ||
    lower.includes("learn") ||
    lower.includes("experience") ||
    lower.includes("topics") ||
    lower.includes("prerequisite") ||
    lower.includes("start")
  ) {
    if (targetUser.id === "u1" || targetTeachSkill.toLowerCase().includes("react")) {
      return `For React & Next.js, my curriculum is super hands-on: we cover modern custom hooks, component composition, App Router server components, clean state management, and real project debugging. What level would you say you're currently starting at?`;
    }
    if (targetUser.id === "u2" || targetTeachSkill.toLowerCase().includes("figma") || targetTeachSkill.toLowerCase().includes("video")) {
      return `In our sessions, I break down Figma auto-layout systems, interactive micro-prototypes, and cinematic DaVinci/Premiere color grading pipelines. I tailor each lesson to your specific learning pace!`;
    }
    if (targetUser.id === "u4" || targetTeachSkill.toLowerCase().includes("spanish") || targetTeachSkill.toLowerCase().includes("yoga")) {
      return `¡Hola! For Spanish, we focus on natural conversational fluency, colloquial idioms, and confidence building, paired with mindfulness breathwork techniques if you like. What are your main goals?`;
    }
    if (targetUser.id === "u5" || targetTeachSkill.toLowerCase().includes("chess") || targetTeachSkill.toLowerCase().includes("machine learning")) {
      return `We will analyze grandmaster opening repertoires, tactical puzzle calculation, and endgames, or dive into neural network architectures and PyTorch implementations depending on your preference!`;
    }
    return `For ${targetTeachSkill}, I focus on practical, project-based milestones so you can see tangible progress every single session. Tell me what specific challenges you're facing right now!`;
  }

  // 4. Greetings / Introduction / Hi / Hello
  if (
    lower === "hi" ||
    lower === "hello" ||
    lower === "hey" ||
    lower.startsWith("hi ") ||
    lower.startsWith("hello ") ||
    lower.startsWith("hey ")
  ) {
    const greetings = [
      `Hey ${currentUser.name}! Great to connect on SynapseLearn. How is your learning journey going today?`,
      `Hi ${currentUser.name}! Nice to meet you. I noticed your profile and I'm very interested in exchanging skills with you!`,
      `Hello ${currentUser.name}! Thanks for saying hi. Are you looking to arrange a skill trade for ${targetTeachSkill}?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 5. Confirmation / Thanks / Appreciation
  if (
    lower.includes("thanks") ||
    lower.includes("thank you") ||
    lower.includes("awesome") ||
    lower.includes("perfect") ||
    lower.includes("great") ||
    lower.includes("deal") ||
    lower.includes("sounds good")
  ) {
    const thankResponses = [
      `You're very welcome! Really excited for our collaboration. Feel free to book our first slot whenever you're ready.`,
      `Awesome, looking forward to it! Let's make this barter super productive for both of us.`,
      `Sounds like a plan! Let me know if you need any prep material before we meet in the live session.`,
    ];
    return thankResponses[Math.floor(Math.random() * thankResponses.length)];
  }

  // 6. Default Contextual Persona Fallback
  return `Thanks for the message, ${currentUser.name}! I'm definitely interested in exploring this further. We can cover ${targetTeachSkill} and I'd love to learn more about your experience with ${currentTeachSkill}. Let's set up a quick 1-on-1 session to get started!`;
}
