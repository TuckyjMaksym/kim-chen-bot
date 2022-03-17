export type TRatesObject = {
    [currency: string]: number;
}
export type TRatesResponseData = {
    timestamp: number;
    base: string;
    rates: TRatesObject
}