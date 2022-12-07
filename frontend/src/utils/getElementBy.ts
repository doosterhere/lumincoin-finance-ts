export class GetElementBy {
    public static id(selector: string): HTMLElement | null {
        return document.querySelector(`#${selector}`);
    }

    public static class(selector: string): HTMLElement | null {
        return document.querySelector(`.${selector}`);
    }
}