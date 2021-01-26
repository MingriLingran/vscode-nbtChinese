import { NbtChunk } from "@webmc/nbt";
import { NbtFile, ViewMessage } from "../../src/types";
import { VsCode } from "./Editor";
import { NbtPath } from "./NbtPath";
import { TreeEditor } from "./TreeEditor";

export class RegionEditor extends TreeEditor {
  private chunks: Partial<NbtChunk>[]

  constructor(root: Element, vscode: VsCode) {
    super(root, vscode)
  }

  redraw() {
    this.content.innerHTML = this.drawRegion(new NbtPath(), this.chunks);
    this.addEvents()
  }

  onInit(file: NbtFile) {
    if (file.region !== true) return
    this.chunks = file.chunks
  }

  onUpdate(file: NbtFile) {
    this.onInit(file)
  }

  onMessage(m: ViewMessage) {
    if (m.type === 'chunk') {
      const index = this.chunks.findIndex(c => c.x === m.body.x && c.z === m.body.z)
      this.chunks[index] = m.body
			this.redraw()
    }
  }

  private drawRegion(path: NbtPath, chunks: Partial<NbtChunk>[]) {
    return chunks.map((c, i) => `<div>
			${this.drawChunk(path.push(i), c)}
		</div>`).join('')
  }

  private drawChunk(path: NbtPath, chunk: Partial<NbtChunk>) {
    const expanded = chunk.nbt && this.isExpanded(path);
    return `<div class="nbt-tag collapse" ${this.on('click', el => this.clickChunk(path, chunk, el))}>
      ${this.drawCollapse(path)}
      ${this.drawIcon('chunk')}
      <span class="nbt-key">Chunk [${chunk.x}, ${chunk.z}]</span>
    </div>
    <div class="nbt-body">
      ${expanded ? this.drawCompound(path, chunk.nbt.value) : ''}
    </div>`
  }

  private clickChunk(path: NbtPath, chunk: Partial<NbtChunk>, el: Element) {
    if (chunk.nbt) {
      this.clickExpandableTag(path, 'compound', chunk.nbt.value, el)
    } else {
      this.expand(path);
      this.vscode.postMessage({ type: 'getChunkData', body: { x: chunk.x, z: chunk.z } });
    }
  }
}
