interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'date' | 'currency';
  required: boolean;
}

interface TemplateData {
  [key: string]: any;
}

class EmailTemplateService {
  // Compilar template reemplazando variables
  static compileTemplate(template: string, data: TemplateData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  // Validar que todas las variables requeridas estén presentes
  static validateTemplateData(variables: TemplateVariable[], data: TemplateData): boolean {
    const requiredVars = variables.filter(v => v.required);
    return requiredVars.every(v => data.hasOwnProperty(v.name));
  }
}