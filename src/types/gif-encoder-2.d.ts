/// <reference types="node" />
declare module "gif-encoder-2" {
    import { NodeCanvasRenderingContext2D } from "canvas"

    interface ByteArray {
        getData(): Buffer
    }
    class GIFEncoder {
        constructor(width: number, 
            height: number, 
            algorithm?: "neuquant" | "octree", 
            useOptimizer?: boolean, 
            totalFrames?: number)
        
        start(): void
        addFrame(context: NodeCanvasRenderingContext2D): void
        setDelay(delay: number): void
        setFrameRate(fps: number): void
        setQuality(quality: number): void
        setThreshold(threshold: number): void
        setRepeat(repeat: number): void
        finish(): void

        out: ByteArray
    }
    export = GIFEncoder
}
