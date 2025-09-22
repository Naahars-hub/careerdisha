import BaseQuestionsForm from '@/components/BaseQuestionsForm';
import styles from './start.module.css';

export default function StartPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <BaseQuestionsForm />
      </div>
    </main>
  );
}