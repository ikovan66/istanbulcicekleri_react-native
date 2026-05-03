export const checkTimeValidity = (tarih) => {
    if (!tarih || typeof tarih !== 'string') return true;
    
    // Check for # delimiter
    if (!tarih.includes('#')) return true;

    // Split to get the limit part (e.g., "09:00-14:00#10:00:00" -> "10:00:00")
    const parts = tarih.split('#');
    if (parts.length < 2) return true;

    const limitTimeStr = parts[1].trim();
    if (!limitTimeStr) return true;

    const now = new Date();
    const [limitHour, limitMinute, limitSecond] = limitTimeStr.split(':').map(Number);

    // Create a date object for today with the limit time
    const limitDate = new Date();
    limitDate.setHours(limitHour, limitMinute, limitSecond || 0, 0);

    // If now is past the limit date, it's invalid
    return now <= limitDate;
};
