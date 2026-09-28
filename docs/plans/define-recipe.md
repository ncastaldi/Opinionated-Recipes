# defining-recipe.md

### 📋 Opinionated-Recipes: Living Design Canvas

#### Core Premise
Establish a strict, highly normalized relational data model for recipes (independent ingredient entities, pure scaling math) powered by an AI-driven chat intake layer that removes structural authoring friction for the user.

#### Settled Choices
- **AI-First Authoring**: The primary MVP creation flow will be conversational prompts extracting available ingredients into a recipe structure.
- **Relational Optionality**: An ingredient's "optional" status is contextual and will be stored as a flag on the join table (`RecipeIngredient`) connecting recipes and ingredients.
- **Backend Yield Math**: Recipes are authored at their natural yield; the backend handles storing the baseline and computing Base-1 ratios for frontend scaling.

#### Discarded Paths
- **Manual Form-Based Ingredient Entry**: Rejected as the primary authoring path to preserve a fluid, frictionless user experience.
- **Implicit Text Ingredients**: Rejected to prevent database pollution and ensure accurate grocery/macro tracking.
- **Strict Base-1 Authoring**: Rejected; users will not be forced to write recipes for a single serving.

#### External Links / Resources
- *None yet.*

#### Open Questions / Tabled Items
- **Preparation Modifiers**: Should textual prep instructions (e.g., "minced", "room temperature") live on the ingredient join table, or strictly within the recipe's method steps?
- **The Cooklang Pipeline**: *[TABLED]* Should the AI output raw Cooklang that gets parsed into the database, or output structured JSON to populate Postgres and compile Cooklang later?
- **Post-MVP Ingestion**: *[TABLED]* How will the URL/web-scraping feature authenticate and normalize messy web data into this strict entity model?