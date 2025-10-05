// Define the structure of a single CV node
interface CvNode {
    __typename: string;
    city: string | null;
    gallery: string | null;
    role: string | null;
    school: string | null;
    section: string; // The key we are grouping by
    title: string | null;
    year: number | null;
}

// Define the structure of the output (grouped data)
interface GroupedCvNodes {
    [section: string]: CvNode[]; // Key is the section (string), value is an array of nodes
}

/**
 * Groups CV nodes by their 'section' key.
 * * @param nodes - The array of CvNode objects (passed directly from the provider).
 * @returns A new object with keys corresponding to the section names, 
 * and values being an array of CvNode objects belonging to that section.
 */
export const groupCvNodesBySection = (nodes: CvNode[]): GroupedCvNodes => {
    
    // Check if the input is a valid array
    if (!Array.isArray(nodes)) {
        console.error("groupCvNodesBySection received invalid input: not an array.");
        return {};
    }

    // Use Array.prototype.reduce to create the grouped object
    const grouped = nodes.reduce((acc: GroupedCvNodes, node: CvNode) => {
        // Ensure the section key exists and is a string
        const sectionKey = node.section?.toUpperCase(); 
        
        if (typeof sectionKey === 'string' && sectionKey.length > 0) {
            // If the accumulator doesn't have an entry for this section, create an empty array
            if (!acc[sectionKey]) {
                acc[sectionKey] = [];
            }
            // Push the current node into the array for that section
            acc[sectionKey].push(node);
        } else {
            // Optional: Log a warning for data with a missing or invalid section
            console.warn("Node found with a missing or invalid 'section' key, skipping:", node);
        }

        return acc;
    }, {}); // Initialize the accumulator as an empty object

    return grouped;
};