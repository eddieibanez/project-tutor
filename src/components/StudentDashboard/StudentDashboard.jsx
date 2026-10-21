import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import styles from './StudentDashboard.module.css';

const languageInfo = [
  {
    id: 'arduino',
    name: 'C++ Arduino',
    description: 'Aprende a programar hardware, microcontroladores y sensores con rigor sintáctico.',
    icon: '🤖',
    colorClass: 'cardArduino'
  },
  {
    id: 'scratch',
    name: 'Scratch',
    description: 'Crea videojuegos y animaciones arrastrando bloques interactivos y escenarios.',
    icon: '🧩',
    colorClass: 'cardScratch'
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Domina el lenguaje líder en computación, ciencia de datos e inteligencia artificial.',
    icon: '🐍',
    colorClass: 'cardPython'
  }
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, previewMode, courses, enrollCourse, leaveCourse } = useContext(AppContext);
  const [enrollModal, setEnrollModal] = useState(false);

  const isPreview = previewMode?.active || user?.isPreview;

  if (!user) {
    navigate('/');
    return null;
  }

  const enrolledCourseIds = user.enrolledCourses || [];
  const enrolledCoursesList = courses.filter(c => enrolledCourseIds.includes(c.id));
  const availableCoursesList = courses.filter(c => !enrolledCourseIds.includes(c.id));

  const totalLessons = languageInfo.reduce((sum, lang) => {
    return sum + (user.progress?.[lang.id]?.lessonsCompleted || 0);
  }, 0);

  const allScores = languageInfo.flatMap(lang => user.progress?.[lang.id]?.quizScores || []);
  const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

  const totalTime = languageInfo.reduce((sum, lang) => {
    return sum + (user.progress?.[lang.id]?.timeSpent || 0);
  }, 0);

  const handleEnterLanguage = (langId) => {
    // En preview mode siempre permitir entrar
    if (isPreview) {
      navigate(`/student/language/${langId}`);
      return;
    }
    if (enrolledCourseIds.length === 0) {
      alert('⚠️ Para ingresar a las lecciones y activar el monitoreo docente, primero debes estar matriculado en al menos 1 curso.');
      setEnrollModal(true);
      return;
    }
    navigate(`/student/language/${langId}`);
  };

  return (
    <div className={styles.dashboard}>
      {/* CABECERA CON ESPACIO AMPLIO Y BIENVENIDA */}
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <h1 className={styles.welcome}>
            ¡Hola, <span className={styles.name}>{user.nombre || user.name}</span>! 👋
          </h1>
          <p className={styles.subtitle}>Plataforma Interactiva para el Aprendizaje de la Programación</p>
          <div className={styles.gradeMeta}>
            <span className={styles.metaPill}>Grado Escolar: {user.grado || user.grade}°</span>
            <span className={styles.metaPill}>Edad: {user.edad || user.age} años</span>
            <span className={styles.metaPillHighlight}>
              {enrolledCoursesList.length > 0
                ? `${enrolledCoursesList.length} Curso(s) Activo(s)`
                : '⚠️ Sin cursos matriculados'}
            </span>
          </div>
        </div>

        <div className={styles.headerActions}>
          {!isPreview && (
            <button type="button" className={styles.btnEnroll} onClick={() => setEnrollModal(true)}>
              + Matricularse en un Curso
            </button>
          )}
        </div>
      </header>

      {/* SECCIÓN OBLIGATORIA: CURSOS MATRICULADOS */}
      <section className={styles.coursesEnrollmentSection}>
        <div className={styles.sectionTitleRow}>
          <h2>📚 Mis Cursos Matriculados ({enrolledCoursesList.length})</h2>
          <span className={styles.sectionHint}>
            {isPreview ? 'Vista de demostración del docente' : 'Es necesario estar en al menos 1 curso para guardar el monitoreo docente'}
          </span>
        </div>

        {enrolledCoursesList.length === 0 ? (
          <div className={styles.enrollmentAlertBox}>
            <div className={styles.alertIcon}>⚠️</div>
            <div className={styles.alertText}>
              <h4>No estás matriculado en ningún curso actualmente</h4>
              <p>Para ingresar a las lecciones prácticas y que tu profesor pueda hacer seguimiento a tu rendimiento, matricúlate en una de las asignaturas disponibles.</p>
              <button type="button" className={styles.btnAlertAction} onClick={() => setEnrollModal(true)}>
                Ver Cursos Disponibles y Matricularme
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.enrolledCoursesGrid}>
            {enrolledCoursesList.map(c => (
              <div key={c.id} className={styles.enrolledCourseCard} style={{ borderLeftColor: c.color || '#00BCD4' }}>
                <div className={styles.courseCardHead}>
                  <span className={styles.courseCode}>{c.code}</span>
                  {!isPreview && (
                    <button 
                      type="button" 
                      className={styles.btnLeaveCourse} 
                      onClick={() => leaveCourse(c.id)}
                      title="Abandonar este curso"
                    >
                      Abandonar Curso
                    </button>
                  )}
                </div>
                <h3 className={styles.courseTitle}>{c.name}</h3>
                <p className={styles.courseDesc}>{c.description}</p>
                <div className={styles.courseFooter}>
                  <span>Horario: {c.schedule}</span>
                  <span className={styles.statusActive}>● Monitoreo Activo</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MÉTRICAS GLOBALES */}
      <section className={styles.statsSection}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalLessons}</span>
          <span className={styles.statLabel}>Lecciones Completadas</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{avgScore}%</span>
          <span className={styles.statLabel}>Puntaje Promedio Quizzes</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalTime} min</span>
          <span className={styles.statLabel}>Tiempo de Práctica</span>
        </div>
      </section>

      {/* RUTAS DE APRENDIZAJE POR LENGUAJE */}
      <section className={styles.cardsGrid}>
        {languageInfo.map((lang) => {
          const progress = user.progress?.[lang.id] || { currentLevel: 1, lessonsCompleted: 0 };
          const progressPercent = Math.round((progress.lessonsCompleted / 15) * 100);
          
          return (
            <div 
              key={lang.id} 
              className={`${styles.languageCard} ${styles[lang.colorClass]}`}
              onClick={() => handleEnterLanguage(lang.id)}
            >
              <div className={styles.cardIcon}>{lang.icon}</div>
              <h2 className={styles.cardTitle}>{lang.name}</h2>
              <p className={styles.cardDesc}>{lang.description}</p>
              
              <div className={styles.progressContainer}>
                <div className={styles.progressInfo}>
                  <span>Nivel Actual: {progress.currentLevel}/15</span>
                  <span>{progressPercent}% completado</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <button className={styles.continueBtn}>
                {enrolledCoursesList.length === 0 ? '🔒 Requiere Curso' : progress.lessonsCompleted === 0 ? 'Comenzar Ruta' : 'Continuar Ruta'}
              </button>
            </div>
          );
        })}
      </section>

      {/* MODAL PARA MATRICULARSE EN CURSOS */}
      {enrollModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>Matricularse en Asignaturas</h3>
              <button type="button" className={styles.modalClose} onClick={() => setEnrollModal(false)}>✕</button>
            </div>

            <p className={styles.modalDesc}>
              Selecciona los cursos en los que deseas inscribirte para que tus profesores puedan evaluar y monitorear tu aprendizaje:
            </p>

            <div className={styles.availableList}>
              {availableCoursesList.length === 0 ? (
                <p className={styles.noMoreCourses}>Ya estás matriculado en todos los cursos disponibles.</p>
              ) : (
                availableCoursesList.map(c => (
                  <div key={c.id} className={styles.availableItem}>
                    <div>
                      <strong>[{c.code}] {c.name}</strong>
                      <p>{c.grade}° Grado • {c.schedule}</p>
                    </div>
                    <button
                      type="button"
                      className={styles.btnEnrollConfirm}
                      onClick={() => {
                        enrollCourse(c.id);
                        setEnrollModal(false);
                      }}
                    >
                      Matricularme
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.btnModalClose} onClick={() => setEnrollModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
