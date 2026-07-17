export function getEligibleAgainstEntries(entries = [], currentType, currentId = '') {
  if (!Array.isArray(entries)) return [];

  const oppositeType = currentType === 'payment' ? 'received' : 'payment';

  return entries.filter((entry) => {
    if (!entry || entry.type !== oppositeType) return false;
    if (entry._id === currentId) return false;
    if (entry.againstId) return false;
    return true;
  });
}
