# Sources

Reading behind the preferences and conventions. Links verified 6 Nov 2026. Order is the reading order.

## Read first: the three that settle the folder question

1. Bulletproof React, project structure chapter - Alan Alickovic
   https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md
   The most cited React layout. Shared code by type, everything else under features/, each feature exposes an index. Rule of thumb: a file goes in a feature if it would be deleted with the feature. Our hybrid is this.

2. Next.js docs, Project structure
   https://nextjs.org/docs/app/getting-started/project-structure
   What Next itself allows: app/ for routes only or colocated, private folders, src/, route groups. Says there is no right way, so our choice has to be our own and written down.

3. Modularizing React Applications with Established UI Patterns - Juntao Qiu, martinfowler.com
   https://www.martinfowler.com/articles/modularizing-react-apps.html
   Why the domain layer (our lib/) exists: keep logic out of components and hooks, treat the frontend as a normal program with layers. The best single article on where logic lives.

## Read second: the ideas behind the layout

4. Screaming Architecture - Robert C. Martin, 2011
   https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html
   The top level of a project should say what it does, not which framework it uses. Short. The reason features/checkout beats components/hooks/utils at the top.

5. Colocation - Kent C. Dodds
   https://kentcdodds.com/blog/colocation
   Put code as close as possible to where it is used: tests, styles, docs next to the component. Explains the co-located CSS module and the __tests__ folder inside lib.

6. Delightful React File/Directory Structure - Josh Comeau, updated Dec 2025
   https://www.joshwcomeau.com/react/file-structure/
   The strongest argument for the other side, grouping by type, plus an honest section on barrel files and their cost. Read to know the counter-case.

## Deeper, when the project grows

7. Feature-Sliced Design
   https://feature-sliced.design/docs/get-started/overview
   A full methodology with layers (app, pages, widgets, features, entities, shared) and a strict import rule between them. Too heavy for a small app, right for a product codebase.

8. Patterns.dev - Lydia Hallie and Addy Osmani, free online
   https://www.patterns.dev/
   React and Next rendering and component patterns. Reference, not a read-through.

## Books

9. A Philosophy of Software Design, 2nd ed. - John Ousterhout
   https://www.amazon.co.uk/Philosophy-Software-Design-2nd/dp/173210221X
   Short book. Deep modules: a small interface over a lot of functionality. The argument for one module with a small public method over ten exported helpers. The best book on the list; read it before Clean Architecture.

10. React Application Architecture for Production - Alan Alickovic, Packt 2023
    The book version of Bulletproof React, built around a Next.js app. Same author, same structure, worked end to end. Search the title on Packt or Amazon.

11. Clean Architecture - Robert C. Martin, 2017
    Dependency direction: business rules do not import frameworks. Our lib/ has no React or Next imports because of this. Skim the first half; the second half is Java-flavoured.
