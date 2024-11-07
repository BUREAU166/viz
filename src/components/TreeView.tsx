import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import Typography from '@mui/material/Typography';

type ProjectStructure = {
    [key: string]: ProjectStructure | null;
};

type ControlledExpansionProps = {
    jsonStructureString: string;
};

export default function ControlledExpansion({ jsonStructureString }: ControlledExpansionProps) {
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructure>({});
    const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
    const [lastClickedItem, setLastClickedItem] = React.useState<string | null>(null);

    React.useEffect(() => {
        try {
            const parsedStructure = JSON.parse(jsonStructureString);
            setProjectStructure(parsedStructure);
        } catch (error) {
            console.error('Error on parsing treeView json respone: ', error);
        }
    }, [jsonStructureString]);

    const handleExpandedItemsChange = (
        event: React.SyntheticEvent,
        itemIds: string[]
    ) => {
        setExpandedItems(itemIds);
    };

    const handleExpandClick = () => {
        const allItems = getAllItemIds(projectStructure);
        setExpandedItems((oldExpanded) => (oldExpanded.length === 0 ? allItems : []));
    };

    const getAllItemIds = (structure: ProjectStructure, parentId: string = ''): string[] => {
        let ids: string[] = [];
        for (const key in structure) {
            const id = parentId ? `${parentId}/${key}` : key;
            ids.push(id);
            if (structure[key] !== null) {
                ids = ids.concat(getAllItemIds(structure[key] as ProjectStructure, id));
            }
        }
        return ids;
    };

    const renderTreeItems = (structure: ProjectStructure, parentId: string = ''): React.ReactNode => {
        return Object.entries(structure).map(([key, value]) => {
            const itemId = parentId ? `${parentId}/${key}` : key;
            return (
                <TreeItem itemId={itemId} key={itemId} label={key}>
                    {value !== null && renderTreeItems(value, itemId)}
                </TreeItem>
            );
        });
    };

    return (
        <Stack>
            <Stack direction="row" spacing={2} alignItems="center">
                <Button onClick={handleExpandClick}>
                    {expandedItems.length === 0 ? 'Expand all' : 'Collapse all'}
                </Button>
                <Typography variant="body1">
                    {lastClickedItem == null || !/\.[^.]+$/.test(lastClickedItem)
                        ? 'No file selected'
                        : `Selected file: ${lastClickedItem}`}
                </Typography>
            </Stack>
            <Box>
                <SimpleTreeView
                    onItemClick={(event, itemId) => setLastClickedItem(itemId)}
                    expandedItems={expandedItems}
                    onExpandedItemsChange={handleExpandedItemsChange}
                >
                    {renderTreeItems(projectStructure)}
                </SimpleTreeView>
            </Box>
        </Stack>
    );
}
