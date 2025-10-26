import './Skills.css';
import { useState } from 'react';

interface SkillsProps {
  skills: Array<string | { name: string; icon?: string }>; // URL или объект с name и icon
}

export default function Skills({ skills }: SkillsProps) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="skills-grid">
      {skills.map((skill, index) => (
        <SkillIcon key={index} skill={skill} />
      ))}
    </div>
  );
}

interface SkillIconProps {
  skill: string | { name: string; icon?: string };
}

function SkillIcon({ skill }: SkillIconProps) {
  const [imageError, setImageError] = useState(false);

  // Если передана просто строка (URL)
  if (typeof skill === 'string') {
    return (
      <div className="skill-icon" title="Технология">
        {!imageError ? (
          <img 
            src={skill} 
            alt="Skill icon"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="skill-icon-text">?</span>
        )}
      </div>
    );
  }

  // Если передан объект с name и опциональным icon
  const { name, icon } = skill;

  return (
    <div className="skill-icon" title={name}>
      {icon && !imageError ? (
        <img 
          src={icon} 
          alt={name}
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="skill-icon-text">
          {name.length <= 3 ? name : name.substring(0, 3).toUpperCase()}
        </span>
      )}
    </div>
  );
}
