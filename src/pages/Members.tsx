import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { ErrorState, LoadingState, PageHero } from "../components/Page";
import Reveal from "../components/Reveal";
import { getMembers } from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { useDocumentTitle } from "../lib/hooks";
import { initialsFor } from "../lib/format";
import { teams } from "../data/content";
import type { CommunityMember } from "../lib/types";

const FILTERS = [
  { id: "all", label: "All Members", keywords: [] as string[] },
  { id: "core", label: "Core Team", keywords: ["core", "lead", "founder", "president"] },
  { id: "technical", label: "Technical Team", keywords: ["tech", "developer", "engineering", "cloud"] },
  { id: "events", label: "Event Management", keywords: ["event", "outreach", "operations"] },
  { id: "design", label: "Design and Media", keywords: ["design", "media", "content", "creative"] },
  { id: "community", label: "Community Members", keywords: [] },
] as const;

function haystack(member: CommunityMember) {
  return [member.team?.name, member.designation, member.course, member.department, member.skills.join(" ")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesCategory(member: CommunityMember, filterId: string) {
  if (filterId === "all" || filterId === "community") return true;
  const filter = FILTERS.find((item) => item.id === filterId);
  if (!filter) return true;
  const text = haystack(member);
  return filter.keywords.some((keyword) => text.includes(keyword));
}

export default function Members() {
  useDocumentTitle("Members directory");
  const { data, loading, error } = useAsync<CommunityMember[]>((signal) => getMembers(signal), []);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const members = data ?? [];

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch =
        query === "" ||
        member.full_name.toLowerCase().includes(query) ||
        haystack(member).includes(query);
      return matchesSearch && matchesCategory(member, filter);
    });
  }, [members, search, filter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    FILTERS.forEach((item) => {
      map[item.id] = members.filter((member) => matchesCategory(member, item.id)).length;
    });
    return map;
  }, [members]);

  return (
    <>
      <PageHero
        index="MEMBERS"
        eyebrow="THE DIRECTORY"
        title="Meet the builders."
        intro="The people who learn, teach, design, organise, and build the community together. Profiles are published only with member consent."
      />

      <section className="section-pad content-section">
        <div className="members-toolbar">
          <label className="members-search" htmlFor="members-search">
            <Search size={15} />
            <input
              id="members-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, team, course or skill"
            />
          </label>
          <span className="members-count">
            {loading ? "LOADING…" : `${visible.length} BUILDER${visible.length === 1 ? "" : "S"}`}
          </span>
        </div>

        <div className="gallery-filters members-filters" role="group" aria-label="Filter members by team">
          {FILTERS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={filter === item.id ? "is-active" : ""}
              onClick={() => setFilter(item.id)}
            >
              {item.label.toUpperCase()}
              {counts[item.id] ? ` (${counts[item.id]})` : ""}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState label="Loading members" />
        ) : error ? (
          <ErrorState message={error} />
        ) : visible.length === 0 ? (
          <div className="page-state page-state-empty">
            <span className="empty-overline">NO MATCHES</span>
            <h3>No builders match this view.</h3>
            <p>Try a different search term or choose another team filter.</p>
          </div>
        ) : (
          <div className="member-grid">
            {visible.map((member, index) => (
              <Reveal className="member-profile-card" key={member.id} delay={(index % 3) * 60}>
                <Link to={`/members/${member.id}`} className="member-profile-media">
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.full_name} loading="lazy" />
                  ) : (
                    <span className="member-avatar large">{initialsFor(member.full_name)}</span>
                  )}
                </Link>
                <div className="member-profile-body">
                  <span className="member-profile-role">{member.designation}</span>
                  <h3>
                    <Link to={`/members/${member.id}`}>{member.full_name}</Link>
                  </h3>
                  {member.team?.name ? <span className="member-profile-team">{member.team.name}</span> : null}
                  <p>{[member.course, member.department, member.academic_year].filter(Boolean).join(" · ")}</p>
                  {member.skills.length > 0 && (
                    <div className="member-skills">
                      {member.skills.slice(0, 3).map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  )}
                  <Link className="text-link" to={`/members/${member.id}`}>
                    View profile <ArrowUpRight size={13} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <div className="members-foot">
          <p>Want to be listed here? Join the community and reach out to the core team.</p>
          <Link className="button button-orange" to="/auth/signup">
            Join the community <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <section className="section-pad content-section members-teams-section">
        <div className="members-teams-intro">
          <p className="eyebrow">THE TEAMS</p>
          <h2>Three teams, three seats each.</h2>
          <p className="members-teams-note">
            Leadership guides the community, Media &amp; Design tells its story, and Events &amp;
            Outreach brings everyone together. Profiles appear here as members publish their details.
          </p>
        </div>

        <div className="members-teams">
          {teams.map((team, teamIndex) => (
            <div className="members-team" key={team.id}>
              <div className="members-team-head">
                <span className="members-team-index">{String(teamIndex + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{team.name}</h3>
                  <p>{team.tagline}</p>
                </div>
              </div>
              <div className="members-team-grid">
                {team.members.map((member, index) => (
                  <article
                    className={`members-team-card${member.placeholder ? " is-placeholder" : ""}`}
                    key={`${team.id}-${index}`}
                  >
                    <div className="members-team-photo">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} loading="lazy" />
                      ) : (
                        <span className="members-team-avatar">
                          {member.placeholder ? "?" : initialsFor(member.name)}
                        </span>
                      )}
                    </div>
                    <div className="members-team-info">
                      <span className="members-team-role">{member.role}</span>
                      <h4>{member.name}</h4>
                      {member.bio && <p>{member.bio}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
