import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { ErrorState, LoadingState } from "../components/Page";
import { getMemberById } from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { useDocumentTitle } from "../lib/hooks";
import { initialsFor } from "../lib/format";
import type { CommunityMember } from "../lib/types";

export default function MemberProfile() {
  const { id = "" } = useParams();
  const { data, loading, error } = useAsync<CommunityMember>((signal) => getMemberById(id, signal), [id]);
  useDocumentTitle(data ? data.full_name : "Member profile");

  if (loading) {
    return (
      <section className="section-pad content-section">
        <LoadingState label="Loading profile" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="section-pad content-section">
        <ErrorState message={error ?? "This member profile could not be found."} />
        <div className="profile-back">
          <Link className="text-link" to="/members">
            <ArrowLeft size={14} /> Back to all members
          </Link>
        </div>
      </section>
    );
  }

  const member = data;

  return (
    <section className="section-pad content-section member-profile-page">
      <div className="profile-back top">
        <Link className="text-link" to="/members">
          <ArrowLeft size={14} /> All members
        </Link>
      </div>

      <div className="member-profile-layout">
        <div className="member-profile-photo">
          {member.photo_url ? (
            <img src={member.photo_url} alt={member.full_name} />
          ) : (
            <span className="member-avatar xlarge">{initialsFor(member.full_name)}</span>
          )}
          <span className="photo-caption">
            {member.team?.name ? member.team.name.toUpperCase() : "COMMUNITY BUILDER"}
          </span>
        </div>

        <div className="member-profile-detail">
          <span className="eyebrow">{member.designation.toUpperCase()}</span>
          <h1>{member.full_name}</h1>
          <p className="member-detail-meta">
            {[member.course, member.department, member.academic_year].filter(Boolean).join(" · ")}
          </p>

          {member.bio && <p className="member-detail-bio">{member.bio}</p>}

          <dl className="member-detail-grid">
            {member.team?.name && (
              <div>
                <dt>TEAM</dt>
                <dd>{member.team.name}</dd>
              </div>
            )}
            {member.department && (
              <div>
                <dt>DEPARTMENT</dt>
                <dd>{member.department}</dd>
              </div>
            )}
            {member.course && (
              <div>
                <dt>COURSE</dt>
                <dd>{member.course}</dd>
              </div>
            )}
            {member.academic_year && (
              <div>
                <dt>ACADEMIC YEAR</dt>
                <dd>{member.academic_year}</dd>
              </div>
            )}
          </dl>

          {member.skills.length > 0 && (
            <div className="member-detail-skills">
              <span className="detail-label">SKILLS</span>
              <div className="member-skills">
                {member.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          <div className="member-detail-links">
            {member.linkedin_url && (
              <a href={member.linkedin_url} target="_blank" rel="noreferrer">
                <Linkedin size={15} /> LinkedIn <ArrowUpRight size={12} />
              </a>
            )}
            {member.github_url && (
              <a href={member.github_url} target="_blank" rel="noreferrer">
                <Github size={15} /> GitHub <ArrowUpRight size={12} />
              </a>
            )}
            <Link to="/suggestions">
              <Mail size={15} /> Suggest a collaboration
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
