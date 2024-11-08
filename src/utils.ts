import { Graphviz } from '@hpcc-js/wasm';

export interface Vertex {
    id: string;
    name: string;
    type: string;
    group: string;
}

export interface Edge {
    fromID: string;
    toID: string;
}

export interface GraphJson {
    vertices: Vertex[];
    edges: Edge[];
}

export function parseLabel(label: string): { type: string; name: string } {
    const cleanedLabel = label.replace(/[{}]/g, '').trim();
    const parts = cleanedLabel.split('|').map((str) => str.trim());

    return {
        type: parts[0].toLowerCase().replace(/[^a-z]/g, ''),
        name: parts[1] ? parts[1].replace(/\\|[^a-zA-Z0-9]/g, '') : ''
    };
}

export async function parseDotFile(dotContent: string): Promise<GraphJson> {
    const graphviz = await Graphviz.load();
    const dotGraph = await graphviz.layout(dotContent, 'json');
    const parsedData = JSON.parse(dotGraph);

    const vertices: Vertex[] = [];
    const edges: Edge[] = [];

    parsedData.objects.forEach((node: any) => {
        const { type, name } = parseLabel(node.label);
        vertices.push({
            id: node.name,
            name: name || node.name,
            type,
            group: "class"
        });
    });

    parsedData.edges.forEach((edge: any) => {
        edges.push({
            fromID: edge.tail,
            toID: edge.head,
        });
    });

    return { vertices, edges };
}

