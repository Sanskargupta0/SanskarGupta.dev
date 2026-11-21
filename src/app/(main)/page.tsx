import { JsonLd } from "~/lib/seo";
import config from "~/config";
import { posts } from "#site/content";
import AboutSection from "~/components/about-section";
import { PostList } from "~/components/post";
import { ProjectList, projects } from "~/components/project";
import Skills from "~/components/skills";
import Experience from "~/components/experience";
import Education from "~/components/education";
import { sortPosts } from "~/lib/utils";
import ContactUs from "../../components/contact-us";
import GitHubContributions from "~/components/github-contributions";

const HomePage = () => {
  // Filter to show only English posts on homepage
  const englishPosts = posts.filter((post) => {
    const postLanguage = post.slug.split("/")[1];
    return postLanguage === "en" && post.published;
  });

  const sortedPosts = sortPosts(englishPosts);

  return (
    <div className="!mt-8 space-y-14">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ProfilePage",
        "@id": `https://${config.domainName}/#profile`, url: `https://${config.domainName}/`,
        name: "Sanskar Gupta", mainEntity: { "@id": `https://${config.domainName}/#person` } }} />
      <AboutSection />
      <Skills />
      <Experience />
      <GitHubContributions />
      <Education />
      <ProjectList projects={projects.slice(0, 4)} metadata />
      <PostList posts={sortedPosts.slice(0, 4).map(post => ({ ...post, markdown: "" }))} showRss layout="single" />
      <ContactUs />
    </div>
  );
};

export default HomePage;
