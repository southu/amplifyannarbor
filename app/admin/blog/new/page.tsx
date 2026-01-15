import ArticleEditorPage from "../[id]/page";

export default function NewArticlePage() {
  return <ArticleEditorPage params={Promise.resolve({ id: "new" })} />;
}
