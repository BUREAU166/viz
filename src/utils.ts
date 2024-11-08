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

const getType = (label: string) => {
    if(label.includes("ClassDecl")) return "class"
    if(label.includes("FunctionDecl")) return "function"
    return "none"
}

export async function parseDotFile(dotContent: string): Promise<GraphJson> {
    const graphviz = await Graphviz.load();
    const dotGraph = await graphviz.layout(dotContent, 'json');
    const parsedData = JSON.parse(dotGraph);

    const vertices: Vertex[] = [];
    const edges: Edge[] = [];
    console.log("PARSED DATA", parsedData)
    parsedData.objects.forEach((node: any) => {
        if(node.label) {
            //const { type, name } = parseLabel(node.label);
            vertices.push({
                id: JSON.stringify(node._gvid),
                name: node.label,
                type: getType(node.label),
                group: "class"
            });
        }
       
    });

    parsedData.edges.forEach((edge: any) => {
        edges.push({
            fromID: JSON.stringify(edge.tail),
            toID: JSON.stringify(edge.head),
        });
    });

    //console.log("PARSED", parsedData)

    return { vertices, edges };
}

