export const formatSeconds = (seconds: number, format: string = 'H:i:s'): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return format
        .replace(/H/g, hours.toString().padStart(2, '0'))
        .replace(/i/g, minutes.toString().padStart(2, '0'))
        .replace(/s/g, secs.toString().padStart(2, '0'));
};