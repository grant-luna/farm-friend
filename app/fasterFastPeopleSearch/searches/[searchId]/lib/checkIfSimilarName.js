"use server"
const natural = require('natural');

export async function checkIfSimilarName(name1, name2) {
  const similaryScore = natural.JaroWinklerDistance(name1, name2);
  const similarityThreshold = 0.75;

  return similaryScore >= similarityThreshold;
}