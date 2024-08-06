"use server"
const natural = require('natural');

export async function checkIfSimilarName(name1, name2) {  
  const similarityScore = natural.JaroWinklerDistance(name1, name2);
  const similarityThreshold = 0.85;
  return similarityScore >= similarityThreshold &&  /[a-z]+/i.test(name1) &&  /[a-z]+/i.test(name2);
}