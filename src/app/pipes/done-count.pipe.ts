import { Pipe, PipeTransform } from '@angular/core';
import { Todo } from '../models';

@Pipe({ name: 'doneCount', standalone: true })
export class DoneCountPipe implements PipeTransform {
  transform(todos: Todo[]): number {
    return todos.filter(t => t.done).length;
  }
}
