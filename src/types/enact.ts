/**
 * Les `.d.ts` d'Enact sont générés depuis les JSDoc, une interface par classe exportée,
 * à partir des `propTypes` déclarés sur cette classe seule. Comme les composants publics
 * sont produits par un `compose()` de HOCs (`Input = InputDecorator(InputBase)`,
 * `Heading = HeadingDecorator(HeadingBase)`…), les props du `Base` ne sont jamais
 * recomposées dans `XxxProps`.
 *
 * Chaque composant étant typé `Merge<React.HTMLProps<HTMLElement>, XxxProps>`, les props
 * perdues ne sont pas absentes : elles sont remplacées par leur homonyme du DOM
 * (`onChange` → `FormEventHandler`, `size` → `number`).
 *
 * `Merge` reproduit l'utilitaire interne d'Enact pour réappliquer la composition oubliée
 * dans les wrappers de `src/components/`.
 */
export type Merge<M, N> = Omit<M, keyof N> & N;
