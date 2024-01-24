
export function MakeEntity(name)
{
    return {
        name,
        isEntity: true
    };
}

export function MakeComposedEntity(a, b)
{
    return {
        name: `${a.name}.${b.name}`,
        isEntity: true
    };
}

export function MakeComponent(name, value)
{
    return {
        name,
        value,
        isComponent: true
    };
}

export class eccg
{
    composeGraph = {};
    invComposeGraph = {};
    componentTypeToEntity = {};

    Compose(entity, object)
    {
        if (object.isComponent || object.isEntity)
        {
            if (!this.composeGraph[entity.name])
            {
                this.composeGraph[entity.name] = [];
            }
            this.composeGraph[entity.name].push(object);

            if (object.isEntity)
            {
                if (!this.invComposeGraph[object.name])
                {
                    this.invComposeGraph[object.name] = [];
                }

                this.invComposeGraph[object.name].push(entity.name);
            }

            if (object.isComponent)
            {
                if (!this.componentTypeToEntity[object.name])
                {
                    this.componentTypeToEntity[object.name] = [];
                }
                this.componentTypeToEntity[object.name].push(entity.name);
            }
        }
        else
        {
            throw new Error(`Unknown object`);
        }
    }

    ShallowQueryEntity(name, path)
    {
        let result = this.composeGraph[name];
        return result ? result.map((obj) => { return { entity: path, composedObject: obj}; }) : [];
    }

    Override(composedOnLeaf, composedOnPath)
    {
        let typeMap = {};

        composedOnLeaf.forEach((obj) => {
            typeMap[obj.composedObject.name] = obj;
        })
        
        composedOnPath.forEach((obj) => {
            typeMap[obj.composedObject.name] = obj;
        })

        return Object.values(typeMap);
    }

    QueryEntity(entity, recursive)
    {
        let entitiesInPath = entity.name.split(".");

        let singleEntityInPath = entitiesInPath.length === 1;

        let leaf = entitiesInPath[entitiesInPath.length - 1];

        let composedOnEntity = this.ShallowQueryEntity(leaf, entity.name);

        // @issue: overrides don't consider subpaths exhaustively
        if (!singleEntityInPath)
        {
            for (let i = entitiesInPath.length; i >= 0; i--)
            {
                let subpath = entitiesInPath.slice(i, entitiesInPath.length).join(".");
                let composedOnEntitySubPath = this.ShallowQueryEntity(subpath, entity.name);

                /* 
                    Everything composed on the full entity path and all subpaths overrides what is composed on the leaf,
                    with the largest path taking precedence
                    This is how we ensure that specific instances can carry custom component values,
                    without affecting the child entities.
                */
                composedOnEntity = this.Override(composedOnEntity, composedOnEntitySubPath);
            }
        }

        if (recursive)
        {
            let resultsCpy = [...composedOnEntity];
            resultsCpy.forEach(element => {
                if (element.composedObject.isEntity)
                {
                    let childEntity = MakeEntity(`${element.entity}.${element.composedObject.name}`);
                    let childResults = this.QueryEntity(childEntity, true);
                    
                    composedOnEntity.push(...childResults);
                }
            });
        }

        return composedOnEntity;
    }

    FindAllParentsInComposeGraph(entity, entityPath, result)
    {
        result[entityPath] = true;

        let invSet = this.invComposeGraph[entity];

        if (invSet)
        {
            invSet.forEach((inv) => {
                let child = `${inv}.${entityPath}`;

                this.FindAllParentsInComposeGraph(inv, child, result)
            })
        }
    }

    QueryComponent(component)
    {
        let directSet = this.componentTypeToEntity[component.name];

        if (!directSet) return [];

        // we use a map to prevent duplicate paths in the return value
        let result = {};

        for (let i = 0; i < directSet.length; i++)
        {
            let direct = directSet[i];

            this.FindAllParentsInComposeGraph(direct, direct, result);
        }

        return Object.keys(result);
    }

    StripQueryWildCard(name)
    {
        return name.split(".").filter(e => e !== "*").join(".")
    }

    Query(obj)
    {
        if (obj.isEntity)
        {
            console.log(`Query entity ${obj.name}`)
            let stripped = this.StripQueryWildCard(obj.name);
            let recursive = stripped.split(".").length !== obj.name.split(".").length;
            return this.QueryEntity(MakeEntity(stripped), recursive);
        }
        else if (obj.isComponent)
        {
            console.log(`Query component ${obj.name}`)
            return this.QueryComponent(obj);
        }
        else
        {
            throw new Error(`Unsupported`);
        }
    }
}