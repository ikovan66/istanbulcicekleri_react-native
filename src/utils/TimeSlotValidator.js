export const checkTimeValidity = (tarih) => {
    if (!tarih || typeof tarih !== 'string') return true;
    
    const now = new Date();

    // Check for # delimiter (e.g., "09:00-14:00#10:00:00" -> deadline is 10:00:00)
    if (tarih.includes('#')) {
        const parts = tarih.split('#');
        if (parts.length < 2) return true;

        const limitTimeStr = parts[1].trim();
        if (!limitTimeStr) return true;

        const [limitHour, limitMinute, limitSecond] = limitTimeStr.split(':').map(Number);
        const limitDate = new Date();
        limitDate.setHours(limitHour, limitMinute, limitSecond || 0, 0);

        return now <= limitDate;
    }

    // No # delimiter — deadline was stripped when saving to DB.
    // Use START time of the slot as conservative deadline.
    // The actual pasife_alma_saati is typically earlier than the slot start time.
    const timeRange = tarih.split('-');
    if (timeRange.length >= 2) {
        const startTimeStr = timeRange[0].trim();
        const [startHour, startMinute] = startTimeStr.split(':').map(Number);
        if (!isNaN(startHour) && !isNaN(startMinute)) {
            const startDate = new Date();
            startDate.setHours(startHour, startMinute, 0, 0);
            return now <= startDate;
        }
    }

    return true;
};
