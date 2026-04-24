/**
 * Empty Table State for when no topics match filters
 */
export default function EmptyState() {
    return (
        <tr>
            <td colSpan={5} style={{ 
                padding: '24px 0', 
                color: 'var(--ink3)', 
                fontStyle: 'italic', 
                fontSize: '13px', 
                textAlign: 'center' 
            }}>
                No concepts match the current filter.
            </td>
        </tr>
    );
}
