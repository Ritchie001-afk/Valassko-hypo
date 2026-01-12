export const formatThousand = (val: number | string): string => {
    if (val === undefined || val === null) return '';
    const num = typeof val === 'string' ? val.replace(/\s/g, '') : val.toString();
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const parseThousand = (val: string): number => {
    const cleaned = val.replace(/\s/g, '');
    return cleaned === '' ? 0 : Number(cleaned);
};
