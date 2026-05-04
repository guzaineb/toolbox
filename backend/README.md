# ProjectStruct - Backend API

## 📋 Description

Backend de la plateforme ProjectStruct, une solution SaaS de structuration et gestion de projets entrepreneuriaux. Cette API RESTful gère l'authentification, les utilisateurs, les profils métiers, les incubateurs, et les experts.

## 🏗 Architecture Technique

- **Framework**: NestJS (architecture modulaire)
- **Base de données**: PostgreSQL
- **ORM**: TypeORM
- **Authentification**: JWT
- **Email**: Nodemailer

## 📦 Modules Principaux

| Module | Description |
|--------|-------------|
| `auth` | Authentification, inscription, vérification email |
| `users` | Gestion des comptes utilisateurs |
| `profiles` | Profils personnels des utilisateurs |
| `project-owner` | Profils porteurs de projet |
| `expert` | Profils experts et domaines d'expertise |
| `incubators` | Gestion des incubateurs |
| `incubator-members` | Gestion des membres d'incubateur |
| `incubator-documents` | Gestion des documents de vérification |

## 🚀 Installation

### Prérequis

- Node.js 20+
- PostgreSQL 14+
- npm ou yarn

### Configuration

1. **Cloner le repository**
```bash
git clone https://github.com/guzaineb/toolbox.git
cd backend
