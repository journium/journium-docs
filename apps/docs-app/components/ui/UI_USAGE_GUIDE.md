# Usage guide

## Lists and sublists

```mdx
<List>
<ListItem>
**Configuration Loading**: The job picks up the configuration from its associated tracker, 
including event filters, instructions, and execution parameters
</ListItem>

<ListItem>
**Data Collection**: The job collects relevant events from your application based on the 
tracker's event selection criteria
</ListItem>

<ListItem>
**Execution History Review**: The job examines previous execution history to understand 
context and avoid redundant analysis
</ListItem>

<ListItem>
**Event Processing**: Relevant events are filtered and prepared for analysis according to 
the tracker's configuration
</ListItem>

<ListItem>
**Instruction Execution**: The tracker's instructions are executed step by step, analyzing 
the collected data
</ListItem>

<ListItem>
**Insight Generation**: If adequate data is available, insights are generated and stored. 
If insufficient data exists, the job completes as a no-op without generating insights


<List>
<ListItem>
**Insight Generation**: If adequate data is available, insights are generated and stored. 
If insufficient data exists, the job completes as a no-op without generating insights
</ListItem>
</List>
</ListItem>
```